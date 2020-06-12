import React, {Component} from 'react';
import { Text, ScrollView } from 'react-native';
import { Card } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';


class contact extends Component {
    
    static navigationOptions = {
        title: 'Contact Us'
    }

    render (){
    return (
        <ScrollView>
                <Animatable.View animation='fadeInDown' duration={2000} delay={1000}>
                    <Card
            title = "Contact Information"
            wrapperStyle={{margin: 20}}>
                <Text style = {{marginBottom: 10}}>
                    1 Nucamp Way
                </Text>
                <Text>
                    Phone Number: 818-515-0364
                </Text>
                <Text>
                    Email: zwile@uci.edu
                    </Text>
                    </Card>
                </Animatable.View>
            </ScrollView>
    );
};
}

export default contact;