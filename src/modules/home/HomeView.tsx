import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Button, Headline, List } from 'react-native-paper';
import { useHistory } from 'react-router';
import { manager } from '../../shared';

const styles = StyleSheet.create({
  containerTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 150,
    justifyContent: 'center',
  },
  containerButton: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 30,
  },
});

export const HomeView: React.FC = () => {
  const [stackActive, setStackActive] = useState(false);
  const [stackInScan, setStackInScan] = useState(false);
  const [stackDevices, setStackDevices] = useState<Array<Device>>([]);

  const history = useHistory();

  useEffect(() => {
    const subscription = manager.onStateChange(state => {
      if (state === 'PoweredOn') {
        setStackActive(true);
        subscription.remove();
      }
    }, true);
    return () => {
      subscription.remove();
      stopScan();
    };
  }, []);

  const scanForConnections = () => {
    setStackInScan(true);
    manager.startDeviceScan(null, {}, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        setStackInScan(false);
        return;
      }

      if (device) {
        setStackDevices(prevStack => {
          if (
            !prevStack.some(deviceStacked => device.id === deviceStacked.id)
          ) {
            return [...prevStack, device];
          }
          return prevStack;
        });
      }
    });
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setStackInScan(false);
    setStackDevices([]);
  };

  const connectDevice = (id: string) => {
    manager.stopDeviceScan();
    setStackInScan(false);
    setStackDevices([]);

    history.push(`/device/${id}`);
  };

  return (
    <>
      <View style={styles.containerTitle}>
        <Headline style={styles.appTitle}>
          Bluetooth test for React Native
        </Headline>
      </View>
      <View style={styles.containerButton}>
        <Button
          icon="cube-scan"
          mode="contained"
          disabled={!stackActive}
          onPress={() => (stackInScan ? stopScan() : scanForConnections())}>
          {stackInScan ? 'Stop scan' : 'Scan for devices'}
        </Button>
      </View>
      <View>
        <List.Section>
          <List.Subheader>List of available devices</List.Subheader>
          {stackDevices.map((device, i) => (
            <List.Item
              key={i}
              title={device.localName}
              description={`ID: ${device.id} - Manufacturer Data: ${device.manufacturerData}`}
              left={() => <List.Icon icon="access-point" />}
              onPress={() => connectDevice(device.id)}
            />
          ))}
        </List.Section>
      </View>
    </>
  );
};
