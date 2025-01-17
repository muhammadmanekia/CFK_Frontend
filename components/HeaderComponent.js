import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const HeaderComponent = ({title, icon = null}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBar_icon}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color={'black'} />
      </TouchableOpacity>
      <View style={styles.topBar_center}>
        {icon && (
          <Ionicons style={styles.icon} name={icon} size={27} color="black" />
        )}
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  topBar_icon: {
    top: 10,
    left: 10,
    height: '100%',
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar_center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
});

export default HeaderComponent;
