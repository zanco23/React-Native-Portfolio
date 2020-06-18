import React, { Component } from 'react';
import {
    Text, View, ScrollView, FlatList,
    Modal, Button, StyleSheet,
    Alert, PanResponder, Share
} from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { CAMPSITES } from '../shared/campsites';
import { COMMENTS } from '../shared/comments';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (campsiteId, rating, author, text) => (postFavorite(campsiteId, rating, author, text))
};

class CampsiteInfo extends Component {

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    handleComment(campsiteId) {
        postComment(JSON.stringify(this.state));
        this.toggleModal();
    }

    recognizeComment() {
        if (gesture > 200) {
            return (
                true
            )
        }
        else {
            return (
                false
            )
        }
    }

    resetForm() {
        this.setState({
            campers: 1,
            hikeIn: false,
            date: '',
            showModal: false
        });
    }

    handleReservation() {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
    };

    constructor(props) {
        super(props);
        this.state = {
            campsites: CAMPSITES,
            comments: COMMENTS,
            rating: 5,
            author: "",
            text: ""
        };
    }

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    static navigationOptions = {
        title: 'Campsite Information'
    };

    render() {
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                />
                <RenderComments comments={comments} />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <Rating
                            showingRating
                            startingValue={this.state.rating}
                            imageSize={40}
                            onFinishRating={rating => this.setState({ rating: rating })}
                            style={{ paddingVertical: 10 }}
                        />
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            leftIconContainerStyle={{ paddingRight: 10 }}
                            onChangeText={author => { this.setState({ author: author }) }}
                            value={this.state.text}
                        />
                        <Input
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            leftIconContainerStyle={{ paddingRight: 10 }}
                            onChangeText={text => { this.setState({ text: text }) }}
                            value={this.state.text}
                        />
                        <View style={{ margin: 10 }}>
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                    this.resetForm();
                                }}
                                color='#808080'
                                title='Cancel'
                            />
                        </View>
                        <View style={{ margin: 10 }}>
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                    this.resetForm();
                                }
                                }
                                color='#5637DD'
                                title='Submit'
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

function RenderCampsite(props) {

    const { campsite } = props;

    const view = React.createRef();

    const recognizeDrag = ({ dx }) => (dx < -200) ? true : false;
    const recognizeComment = ({ dx }) => (dx > 200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            } else if (recognizeComment(gestureState)) {
                props.onShowModal();
            }
            return true;
        }
    });

    const shareCampsite = (title, message, url) => {
        Share.share({
            title: title,
            message: `${title}: ${message} ${url}`,
            url: url
        }, {
            dialogTitle: 'Share ' + title
        });
    };

    if (campsite) {
        return (
            <Animatable.View
                animation='fadeInDown'
                duration={2000}
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={campsite.name}
                    image={{ uri: baseUrl + campsite.image }}>
                    <Text style={{ margin: 10 }}>
                        {campsite.description}
                    </Text>
                    <View style={styles.formRow}>
                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()}
                        />
                        <Icon style={styles.formItem}
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome pencil'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />
                        <Icon
                            name={'share'}
                            type='font-awesome'
                            color='#5637DD'
                            style={styles.cardItem}
                            raised
                            reverse
                            onPress={() => shareCampsite(campsite.name, campsite.description, baseUrl + campsite.image)}
                        />
                    </View>
                </Card>
            </Animatable.View>
        ) } 
        return <View />;
    }

    function RenderComments({ comments }) {

        const renderCommentItem = ({ item }) => {
            return (
                <View style={{ margin: 10 }}>
                    <Text style={{ fontSize: 14 }}>{item.text}</Text>
                    <Rating
                        readOnly
                        startingValue={item.rating}
                        imageSize={10}
                        style={{ paddingVertical: "5%", alignItems: "flex-start" }}
                    />
                    <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${item.date}`}</Text>
                </View>
            );
        };

        return (
            <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
                <Card title='Comments'>
                    <FlatList
                        data={comments}
                        renderItem={renderCommentItem}
                        keyExtractor={item => item.id.toString()}
                    />
                </Card>
            </Animatable.View>
        );
    }


    const styles = StyleSheet.create(
        {
            formRow: {
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                flexDirection: 'row',
                margin: 20
            },
            formItem: {
                flex: 1,
                margin: 10,
            },
            modal: {
                justifyContent: 'center',
                margin: 20
            }
        }
    );
export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);