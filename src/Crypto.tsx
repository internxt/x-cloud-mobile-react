import { Kyber } from 'crystals-kyber';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

const KyberEncryptionApp = () => {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const performKyberEncryption = async () => {
    try {
      // Generate Kyber key pair
      const keyPair = Kyber.generateKeyPair();

      // Encrypt the message
      const encryptionResult = Kyber.encrypt(keyPair.publicKey, Buffer.from(message, 'utf-8'));

      // Convert to base64 for storage/transmission
      setEncryptedMessage(encryptionResult.ciphertext.toString('base64'));

      // Demonstrate decryption
      const decrypted = Kyber.decrypt(keyPair.privateKey, encryptionResult.ciphertext);

      setDecryptedMessage(decrypted.toString('utf-8'));
    } catch (error) {
      console.error('Encryption error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post-Quantum Encryption</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter message to encrypt"
        value={message}
        onChangeText={setMessage}
      />

      <Button title="Encrypt & Decrypt" onPress={performKyberEncryption} />

      {encryptedMessage ? (
        <View style={styles.resultContainer}>
          <Text>Encrypted Message:</Text>
          <Text>{encryptedMessage}</Text>

          <Text>Decrypted Message:</Text>
          <Text>{decryptedMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default KyberEncryptionApp;
