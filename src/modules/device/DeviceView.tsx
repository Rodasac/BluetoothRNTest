import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Characteristic, Device, Service } from 'react-native-ble-plx';
import {
  Appbar,
  Headline,
  List,
  Snackbar,
  Text,
  Title,
} from 'react-native-paper';
import { useHistory, useParams } from 'react-router';
import { manager } from '../../shared';

export const DeviceView: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [visibleMessage, setVisibleMessage] = useState('');
  const [device, setDevice] = useState<Device | null>(null);
  const [services, setServices] = useState<Array<Service>>([]);
  const [charateristicsByService, setCharateristicsByService] = useState<{
    [k: string]: Array<Characteristic> | undefined;
  }>({});

  const { id } = useParams<{ id: string }>();

  const history = useHistory();

  useEffect(() => {
    const connectToDevice = async (idToConnect: string) => {
      try {
        const deviceConnected = await manager.connectToDevice(idToConnect);
        const deviceWithDiscoveredServices =
          await deviceConnected.discoverAllServicesAndCharacteristics();
        const servicesToSave = await deviceWithDiscoveredServices.services();
        setServices(servicesToSave);
        setDevice(deviceWithDiscoveredServices);
      } catch (e) {
        console.log(e);
        setVisibleMessage(
          "It's not posible to connect or discover all services",
        );
        setVisible(true);
      }
    };
    if (id && !device) {
      connectToDevice(id);
    }

    return () => {
      device?.cancelConnection();
    };
  }, [id, device]);

  useEffect(() => {
    const getCharacteristicsForAllServices = async (serviceToGet: Service) => {
      const characteristics = await serviceToGet.characteristics();
      let charsToSave: Characteristic[];
      try {
        const promiseChars = characteristics.map(
          async characteristic => await characteristic.read(),
        );
        charsToSave = await Promise.all(promiseChars);
      } catch (e) {
        console.log(e);
        charsToSave = characteristics;
      }
      setCharateristicsByService(prevChars => ({
        ...prevChars,
        [serviceToGet.id]: charsToSave,
      }));
    };

    if (services.length > 0) {
      services.forEach(service => {
        getCharacteristicsForAllServices(service);
      });
    }
  }, [services]);

  const onDismissSnackBar = () => setVisible(false);

  const closeConnection = () => {
    device?.cancelConnection();

    setDevice(null);
    history.goBack();
  };

  if (!device) {
    return (
      <View>
        <Headline>There is no connected device yet.</Headline>
      </View>
    );
  }

  return (
    <>
      <Appbar>
        <Appbar.BackAction onPress={closeConnection} />
        <Appbar.Content title={device.name} subtitle={device.localName} />
        <Appbar.Action icon="close" onPress={closeConnection} />
      </Appbar>
      <View>
        <List.Section>
          <List.Subheader>List of available services</List.Subheader>
          {services.map((service, i) => (
            <List.Item
              key={i}
              title={`${service.id} - ${service.uuid}`}
              description={() =>
                charateristicsByService[service.id]?.map(characteristicItem => (
                  <React.Fragment
                    key={`chars-${service.uuid}-${characteristicItem.uuid}`}>
                    <Title>Characteristics:</Title>
                    <Text>- ID: {characteristicItem.id}</Text>
                    <Text>- UUID: {characteristicItem.uuid}</Text>
                    <Text>
                      - VALUE: {characteristicItem.value ?? 'NOT APPLY'}
                    </Text>
                  </React.Fragment>
                ))
              }
              left={() => <List.Icon icon="access-point" />}
            />
          ))}
        </List.Section>
      </View>
      <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
        {visibleMessage}
      </Snackbar>
    </>
  );
};
