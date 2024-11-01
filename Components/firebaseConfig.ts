import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAIUPo9ObMtdlHUEiH32D5vxsVn_Z86xag",
  authDomain: "wordwhiz-195d1.firebaseapp.com",
  projectId: "wordwhiz-195d1",
  storageBucket: "wordwhiz-195d1.appspot.com",
  messagingSenderId: "1010756774819",
  appId: "1:1010756774819:web:5792ee8af2d8822b7e0816",
  measurementId: "G-741XMJWL17"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
