//
//  KyberCryptoTests.swift
//  Internxt
//
//

import XCTest
@testable import YourProjectName

class KyberCryptoTests: XCTestCase {
    func testKeyGeneration() {
        let kyber = KyberCrypto()
        let keyPair = kyber.generateAsymmetricKeyPair()
        XCTAssertEqual(keyPair?.publicKey.count ?? 0 > 0, true, "Public key should be non-empty")
        XCTAssertEqual(keyPair?.privateKey.count ?? 0 > 0, true, "Private key should be non-empty")
        XCTAssertNotNil(keyPair, "Key pair generation failed unexpectedly")
        XCTAssertEqual(keyPair?.publicKey.count ?? 0 > 0, true, "Expected a non-empty public key")
    }

    func testEncryption() {
        let kyber = KyberCrypto()
        guard let keyPair = kyber.generateAsymmetricKeyPair() else {
            XCTFail("Key generation failed")
            return
        }

        let message = "Test Message".data(using: .utf8)!
        let encryptionResult = kyber.encryptMessage(message, using: keyPair.publicKey)
        XCTAssertNotNil(encryptionResult, "Encryption result should not be nil")
        XCTAssertNotNil(encryptionResult?.ciphertext, "Ciphertext should not be nil")
    }

    func testDecryption() {
        let kyber = KyberCrypto()
        guard let keyPair = kyber.generateAsymmetricKeyPair() else {
            XCTFail("Key generation failed")
            return
        }

        let message = "Test Message".data(using: .utf8)!
        guard let encryptionResult = kyber.encryptMessage(message, using: keyPair.publicKey) else {
            XCTFail("Encryption failed")
            return
        }

        let decryptionResult = kyber.decryptCiphertext(encryptionResult.ciphertext, using: keyPair.privateKey)
        XCTAssertNotNil(decryptionResult, "Decryption result should not be nil")
        XCTAssertEqual(decryptionResult?.message, message, "Decrypted message should match the original")
    }
    func testInvalidKeySize() {
        let kyber = KyberCrypto()
        kyber.keySize = 999 // Invalid key size
        let keyPair = kyber.generateAsymmetricKeyPair()
        XCTAssertNil(keyPair, "Key generation should fail for invalid key size")

    }

    func testKyberEncryptionManager() {
        let message = "Hello, Kyber!".data(using: .utf8)!
        guard let keyPair = KyberCrypto().generateAsymmetricKeyPair() else {
            XCTFail("Key generation failed")
            return
        }

        do {
            let encryptionResult = try KyberEncryptionManager.encryptMessage(message, with: keyPair.publicKey)
            let decryptionResult = try KyberEncryptionManager.decryptCiphertext(encryptionResult.ciphertext, with: keyPair.privateKey)

            XCTAssertEqual(decryptionResult.message, message, "Decrypted message should match the original")
        } catch {
            XCTFail("Encryption/Decryption failed with error: \(error)")
        }
    }

    func testDynamicKeySizes() {
        let sizes = [512, 768, 1024]
        for size in sizes {
            let kyber = KyberCrypto()
            let keyPair = kyber.generateAsymmetricKeyPair(size: size)
            XCTAssertNotNil(keyPair, "Key pair generation should work for size \(size)")
        }
    }

     func testCustomConfig() {
        let config = KyberConfig(keySize: 1024)
        let kyber = KyberCrypto(config: config)
        let keyPair = kyber.generateAsymmetricKeyPair()
        XCTAssertNotNil(keyPair, "Key pair generation should succeed with custom config")
    }

}
