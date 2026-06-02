// ═══════════════════════════════════════
// OpportuNet Cameroon — Firebase Config
// ═══════════════════════════════════════

// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, addDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBdh5k3bbT16H36GUQ1WiF8h43srR9-37Y",
  authDomain: "opportunet-cameroon.firebaseapp.com",
  projectId: "opportunet-cameroon",
  storageBucket: "opportunet-cameroon.firebasestorage.app",
  messagingSenderId: "102323783612",
  appId: "1:102323783612:web:30c5d0d2fa036ec102cdb9"
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ─── AUTH FUNCTIONS ─────────────────────

// Sign up new user
async function firebaseSignup(data) {
  try {
    // Create auth account
    var cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    var uid  = cred.user.uid;

    // Save user profile to Firestore
    await setDoc(doc(db, 'users', uid), {
      id:                 uid,
      email:              data.email.toLowerCase(),
      type:               data.type,
      name:               data.name,
      createdAt:          new Date().toISOString(),
      companyDescription: data.companyDescription || '',
      companyType:        data.companyType        || '',
      companyWebsite:     data.companyWebsite      || '',
      companyRegion:      data.companyRegion       || '',
      bio:                data.bio        || '',
      region:             data.region     || '',
      phone:              data.phone      || '',
      skills:             data.skills     || [],
      education:          data.education  || [],
      experience:         data.experience || []
    });

    // Save to localStorage for session
    var user = await getUserFromFirestore(uid);
    localStorage.setItem('opportunet_current_user', JSON.stringify(user));
    return { success: true, user: user };

  } catch (err) {
    var msg = 'Signup failed.';
    if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
    if (err.code === 'auth/weak-password')        msg = 'Password must be at least 6 characters.';
    if (err.code === 'auth/invalid-email')        msg = 'Please enter a valid email address.';
    return { success: false, message: msg };
  }
}

// Sign in existing user
async function firebaseLogin(email, password) {
  try {
    var cred = await signInWithEmailAndPassword(auth, email, password);
    var user = await getUserFromFirestore(cred.user.uid);
    localStorage.setItem('opportunet_current_user', JSON.stringify(user));
    return { success: true, user: user };
  } catch (err) {
    return { success: false, message: 'Incorrect email or password.' };
  }
}

// Sign out
async function firebaseLogout() {
  await signOut(auth);
  localStorage.removeItem('opportunet_current_user');
  window.location.href = 'index.html';
}

// Get user profile from Firestore
async function getUserFromFirestore(uid) {
  var snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Update user profile in Firestore
async function firebaseUpdateUser(updatedData) {
  var current = JSON.parse(localStorage.getItem('opportunet_current_user'));
  if (!current) return { success: false };
  var ref = doc(db, 'users', current.id);
  await setDoc(ref, updatedData, { merge: true });
  var updated = Object.assign({}, current, updatedData);
  localStorage.setItem('opportunet_current_user', JSON.stringify(updated));
  return { success: true, user: updated };
}

// ─── LISTINGS FUNCTIONS ──────────────────

// Save a new listing to Firestore
async function firebaseSaveListing(listing) {
  listing.postedAt = new Date().toISOString();
  listing.status   = 'active';
  var ref = await addDoc(collection(db, 'listings'), listing);
  listing.id = ref.id;
  return listing;
}

// Get all listings posted by a company
async function firebaseGetCompanyListings(userId) {
  var q    = query(collection(db, 'listings'), where('postedBy', '==', userId));
  var snap = await getDocs(q);
  return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
}

// Delete a listing
async function firebaseDeleteListing(listingId) {
  await deleteDoc(doc(db, 'listings', listingId));
}

// Get all listings (static + Firebase)
async function firebaseGetAllListings() {
  var snap = await getDocs(collection(db, 'listings'));
  var userListings = snap.docs.map(function(d) {
    return Object.assign({ id: d.id }, d.data());
  });
  return OPPORTUNITIES.concat(userListings);
}

// ─── USERS DIRECTORY FUNCTIONS ───────────

// Get all company profiles
async function firebaseGetCompanies() {
  var q    = query(collection(db, 'users'), where('type', '==', 'company'));
  var snap = await getDocs(q);
  return snap.docs.map(function(d) { return d.data(); });
}

// Get all youth profiles
async function firebaseGetPeople() {
  var q    = query(collection(db, 'users'), where('type', '==', 'youth'));
  var snap = await getDocs(q);
  return snap.docs.map(function(d) { return d.data(); });
}

// ─── OVERRIDE Auth object ────────────────
// Replace localStorage Auth with Firebase Auth

var FirebaseAuth = {
  getCurrentUser: function() {
    var u = localStorage.getItem('opportunet_current_user');
    return u ? JSON.parse(u) : null;
  },

  signup: async function(data) {
    return await firebaseSignup(data);
  },

  login: async function(email, password) {
    return await firebaseLogin(email, password);
  },

  logout: async function() {
    await firebaseLogout();
  },

  updateUser: async function(data) {
    return await firebaseUpdateUser(data);
  },

  saveListing: async function(listing) {
    return await firebaseSaveListing(listing);
  },

  getCompanyListings: async function(userId) {
    return await firebaseGetCompanyListings(userId);
  },

  deleteListing: async function(id) {
    return await firebaseDeleteListing(id);
  },

  getAllListings: async function() {
    return await firebaseGetAllListings();
  },

  getCompanies: async function() {
    return await firebaseGetCompanies();
  },

  getPeople: async function() {
    return await firebaseGetPeople();
  },

  requireLogin: function(redirectTo) {
    var user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + (redirectTo || '');
      return null;
    }
    return user;
  },

  requireCompany: function() {
    var user = this.requireLogin('dashboard.html');
    if (!user) return null;
    if (user.type !== 'company') {
      window.location.href = 'profile.html';
      return null;
    }
    return user;
  },

  requireYouth: function() {
    var user = this.requireLogin('profile.html');
    if (!user) return null;
    if (user.type !== 'youth') {
      window.location.href = 'dashboard.html';
      return null;
    }
    return user;
  }
};

// ─── Update navbar ───────────────────────
function updateNavbar() {
  var user    = FirebaseAuth.getCurrentUser();
  var actions = document.querySelector('.navbar-actions');
  if (!actions) return;

  if (user) {
    var dashLink = user.type === 'company' ? 'dashboard.html' : 'profile.html';
    var initial  = user.name.charAt(0).toUpperCase();
    actions.innerHTML =
      '<a href="' + dashLink + '" style="display:flex;align-items:center;gap:8px;' +
        'font-size:13px;color:rgba(255,255,255,0.8);text-decoration:none;">' +
        '<div style="width:32px;height:32px;border-radius:50%;' +
          'background:var(--green-700);display:flex;align-items:center;' +
          'justify-content:center;font-family:var(--font-display);' +
          'font-weight:700;font-size:13px;color:white;">' +
          initial +
        '</div>' +
        '<span>' + user.name + '</span>' +
      '</a>' +
      '<button class="btn-ghost" onclick="FirebaseAuth.logout()" ' +
        'style="font-size:12px;padding:6px 14px;">Logout</button>';
  } else {
    actions.innerHTML =
      '<button class="btn-ghost" onclick="window.location.href=\'login.html\'">' +
        'Sign In' +
      '</button>' +
      '<button class="btn-primary" onclick="window.location.href=\'signup.html\'">' +
        'Create Account' +
      '</button>';
  }
}

export { FirebaseAuth, updateNavbar, firebaseGetCompanies, firebaseGetPeople, firebaseGetAllListings };