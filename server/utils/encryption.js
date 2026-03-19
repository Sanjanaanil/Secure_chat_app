
const crypto = require('crypto');

// Encryption utility class for end-to-end encryption
class Encryption {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    // In production, use a proper key management system
    // For demo, we'll use an environment variable
    this.secretKey = crypto.createHash('sha256')
      .update(process.env.ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long!!')
      .digest('base64')
      .substr(0, 32);
  }

  // Generate random initialization vector
  generateIV() {
    return crypto.randomBytes(16);
  }

  // Encrypt message
  encrypt(text) {
    try {
      const iv = this.generateIV();
      const cipher = crypto.createCipheriv(
        this.algorithm, 
        Buffer.from(this.secretKey), 
        iv
      );
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encryptedContent: encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt message
  decrypt(encryptedData) {
    try {
      const { encryptedContent, iv } = encryptedData;
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.secretKey),
        Buffer.from(iv, 'hex')
      );
      
      let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  // Encrypt file (for optional file sharing)
  async encryptFile(fileBuffer) {
    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.secretKey),
      iv
    );
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    return {
      encryptedContent: encrypted.toString('base64'),
      iv: iv.toString('hex')
    };
  }

  // Decrypt file
  async decryptFile(encryptedData) {
    const { encryptedContent, iv } = encryptedData;
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.secretKey),
      Buffer.from(iv, 'hex')
    );
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedContent, 'base64')),
      decipher.final()
    ]);
    
    return decrypted;
  }
}

module.exports = new Encryption();