
import CryptoJS from 'crypto-js';

const KEY = "eD(t((ti0nN*c200"; 
const ALG = "AES";
const TRANSFORMATION = "AES/ECB/PKCS5Padding";

export const encryptOTP = (input) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(input, CryptoJS.enc.Utf8.parse(KEY), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs5
    });
    return encrypted.toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

export const decryptOTP = (encryptedInput) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedInput, CryptoJS.enc.Utf8.parse(KEY), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const compareOTP = (enteredOTP, encryptedOTPFromServer) => {
  try {
    console.log("Entered OTP:", enteredOTP);
    console.log("Encrypted OTP from server:", encryptedOTPFromServer);
    const decryptedOTP = decryptOTP(encryptedOTPFromServer);
    console.log("Decrypted OTP:", decryptedOTP === enteredOTP);
    return decryptedOTP === enteredOTP;
  } catch (error) {
    console.error("OTP comparison error:", error);
    return false;
  }
};
