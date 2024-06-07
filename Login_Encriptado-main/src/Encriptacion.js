import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';
import { js2xml, xml2js } from 'xml-js';

const Encriptacion1 = ({ setEncryptedData, setStep }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    const minLength = 8;
    const uppercasePattern = /[A-Z]/;
    const lowercasePattern = /[a-z]/;
    const specialCharPattern = /[.\-_!$@?%#&]/;
    const sequencePattern = /(.)\1\1|012|123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210/;

    if (password.length < minLength) return "La contraseña debe tener al menos 8 caracteres.";
    if (!uppercasePattern.test(password)) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!lowercasePattern.test(password)) return "La contraseña debe contener al menos una letra minúscula.";
    if (!specialCharPattern.test(password)) return "La contraseña debe contener al menos un carácter especial.";
    if (sequencePattern.test(password)) return "La contraseña no debe contener secuencias o series repetitivas.";

    return "";
  };

  const handleEncrypt = () => {
    const errorMessage = validatePassword(password);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setError('');

    const encryptedUsername = CryptoJS.AES.encrypt(username, 'secretKey').toString();
    const encryptedPassword = CryptoJS.AES.encrypt(password, 'secretKey').toString();

    const xmlData = {
      user: {
        username: encryptedUsername,
        password: encryptedPassword
      }
    };

    const xml = js2xml(xmlData, { compact: true, ignoreComment: true, spaces: 4 });
    setEncryptedData(xml);
    downloadXML(xml);
  };

  const downloadXML = (xml) => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ContraseñaEncriptada.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h1>ENCRIPTAR:</h1>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleEncrypt}>Encrypt</button>
      <button onClick={() => setStep(2)}>Siguiente</button>
    </div>
  );
};

const DecryptionForm = ({ encryptedData, setEncryptedData, setStep }) => {
  const [decryptedData, setDecryptedData] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setEncryptedData(content);
    };
    reader.readAsText(file);
  };

  const handleDecrypt = () => {
    try {
      const parsedXml = xml2js(encryptedData, { compact: true });
      const decryptedUsername = CryptoJS.AES.decrypt(parsedXml.user.username._text, 'secretKey').toString(CryptoJS.enc.Utf8);
      const decryptedPassword = CryptoJS.AES.decrypt(parsedXml.user.password._text, 'secretKey').toString(CryptoJS.enc.Utf8);

      setDecryptedData(`Username: ${decryptedUsername}, Password: ${decryptedPassword}`);
    } catch (error) {
      setError('Error al descifrar los datos.');
    }
  };

  return (
    <div>
      <h1>DESENCRIPTAR:</h1>
      <input type="file" accept=".xml" onChange={handleFileUpload} />
      <button onClick={handleDecrypt}>Decrypt</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h2>Desencriptación:</h2>
        <p>{decryptedData}</p>
      </div>
      <button onClick={() => setStep(1)}>Regresar</button>
    </div>
  );
};

const Encriptacion = () => {
  const [step, setStep] = useState(1); // Estado para controlar el paso (1: encriptar, 2: desencriptar)
  const [encryptedData, setEncryptedData] = useState('');

  return (
    <div className="container">
      {step === 1 ? (
        <Encriptacion setEncryptedData={setEncryptedData} setStep={setStep} />
      ) : (
        <DecryptionForm encryptedData={encryptedData} setEncryptedData={setEncryptedData} setStep={setStep} />
      )}
    </div>
  );
};

export default Encriptacion1;
