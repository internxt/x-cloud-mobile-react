import Foundation
import SwiftKyber

class KyberCrypto {
    // Generate a public-private key pair for asymmetric encryption
    // - Returns: A tuple containing the public key and private key as Data, or nil in case of an error.
    func generateAsymmetricKeyPair() -> (publicKey: Data, privateKey: Data)? {
        do {
            let keyPair = try Kyber.generateKeyPair(keySize: keySize)
            return (keyPair.publicKey, keyPair.privateKey)
        } catch {
            print("Error generating asymmetric keys: \(error)")
            return nil
        }
    }


    // Encrypt a message using a public key
    // - Parameters:
    //   - message: The data to encrypt.
    //   - publicKey: The public key used for encryption.
    // - Returns: A tuple containing the ciphertext and the shared secret, or nil in case of an error.
    func encryptMessage(_ message: Data, using publicKey: Data) -> (ciphertext: Data, sharedSecret: Data)? {
        do {
            let encryptionResult = try Kyber.encrypt(publicKey: publicKey, message: message)
            return (encryptionResult.ciphertext, encryptionResult.sharedSecret)
        } catch {
            print("Error encrypting message: \(error)")
            return nil
        }
    }

    // Decrypt a ciphertext with a private key
    func decryptCiphertext(_ ciphertext: Data, using privateKey: Data) -> (message: Data, sharedSecret: Data)? {
        do {
            let decryptionResult = try Kyber.decrypt(privateKey: privateKey, ciphertext: ciphertext)
            return (decryptionResult.message, decryptionResult.sharedSecret)
        } catch {
            print("Error decrypting ciphertext: \(error)")
            return nil
        }
    }
}
