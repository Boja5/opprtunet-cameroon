// ═══════════════════════════════════════
// OpportuNet Cameroon — Auth System
// Uses localStorage as our database
// ═══════════════════════════════════════

var Auth = {

  // ─── Get all users ──────────────────
  getUsers: function() {
    var users = localStorage.getItem('opportunet_users');
    return users ? JSON.parse(users) : [];
  },

  // ─── Save all users ─────────────────
  saveUsers: function(users) {
    localStorage.setItem('opportunet_users', JSON.stringify(users));
  },

  // ─── Get current logged in user ─────
  getCurrentUser: function() {
    var user = localStorage.getItem('opportunet_current_user');
    return user ? JSON.parse(user) : null;
  },

  // ─── Save current session ───────────
  setCurrentUser: function(user) {
    localStorage.setItem('opportunet_current_user', JSON.stringify(user));
  },

  // ─── Clear session (logout) ─────────
  clearCurrentUser: function() {
    localStorage.removeItem('opportunet_current_user');
  },

  // ─── Sign up ────────────────────────
  signup: function(data) {
    var users = this.getUsers();

    // Check if email already exists
    var exists = users.find(function(u) {
      return u.email.toLowerCase() === data.email.toLowerCase();
    });
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Create new user
    var newUser = {
      id:        'user_' + Date.now(),
      email:     data.email.toLowerCase(),
      password:  data.password,
      type:      data.type,
      name:      data.name,
      createdAt: new Date().toISOString(),

      // Company-specific fields
      companyDescription: data.companyDescription || '',
      companyType:        data.companyType        || '',
      companyWebsite:     data.companyWebsite      || '',
      companyRegion:      data.companyRegion       || '',

      // Youth-specific fields
      bio:        data.bio        || '',
      region:     data.region     || '',
      phone:      data.phone      || '',
      skills:     data.skills     || [],
      education:  data.education  || [],
      experience: data.experience || []
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  // ─── Login ──────────────────────────
  login: function(email, password) {
    var users = this.getUsers();
    var user  = users.find(function(u) {
      return u.email.toLowerCase() === email.toLowerCase() &&
             u.password === password;
    });
    if (!user) {
      return { success: false, message: 'Incorrect email or password.' };
    }
    this.setCurrentUser(user);
    return { success: true, user: user };
  },

  // ─── Logout ─────────────────────────
  logout: function() {
    this.clearCurrentUser();
    window.location.href = 'index.html';
  },

  // ─── Update user data ────────────────
  updateUser: function(updatedData) {
    var users   = this.getUsers();
    var current = this.getCurrentUser();
    var index   = users.findIndex(function(u) { return u.id === current.id; });
    if (index === -1) return { success: false };

    var updated = Object.assign(users[index], updatedData);
    users[index] = updated;
    this.saveUsers(users);
    this.setCurrentUser(updated);
    return { success: true, user: updated };
  },

  // ─── Require login ───────────────────
  requireLogin: function(redirectTo) {
    var user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + (redirectTo || '');
      return null;
    }
    return user;
  },

  // ─── Require company account ─────────
  requireCompany: function() {
    var user = this.requireLogin('dashboard.html');
    if (!user) return null;
    if (user.type !== 'company') {
      window.location.href = 'profile.html';
      return null;
    }
    return user;
  },

  // ─── Require youth account ───────────
  requireYouth: function() {
    var user = this.requireLogin('profile.html');
    if (!user) return null;
    if (user.type !== 'youth') {
      window.location.href = 'dashboard.html';
      return null;
    }
    return user;
  },

  // ─── Get company listings ────────────
  getCompanyListings: function(userId) {
    var listings = localStorage.getItem('opportunet_listings');
    listings = listings ? JSON.parse(listings) : [];
    return listings.filter(function(l) { return l.postedBy === userId; });
  },

  // ─── Save a new listing ──────────────
  saveListing: function(listing) {
    var listings = localStorage.getItem('opportunet_listings');
    listings = listings ? JSON.parse(listings) : [];
    listing.id       = 'listing_' + Date.now();
    listing.postedAt = new Date().toISOString();
    listing.status   = 'active';
    listings.push(listing);
    localStorage.setItem('opportunet_listings', JSON.stringify(listings));
    return listing;
  },

  // ─── Delete a listing ────────────────
  deleteListing: function(listingId) {
    var listings = localStorage.getItem('opportunet_listings');
    listings = listings ? JSON.parse(listings) : [];
    listings = listings.filter(function(l) { return l.id !== listingId; });
    localStorage.setItem('opportunet_listings', JSON.stringify(listings));
  },

  // ─── Get all listings (static + user posted) ──
  getAllListings: function() {
    var userListings = localStorage.getItem('opportunet_listings');
    userListings = userListings ? JSON.parse(userListings) : [];
    return OPPORTUNITIES.concat(userListings);
  }
};

// ─── Update navbar based on login state ──
function updateNavbar() {
  var user    = Auth.getCurrentUser();
  var actions = document.querySelector('.navbar-actions');
  if (!actions) return;

  if (user) {
    var dashLink = user.type === 'company' ? 'dashboard.html' : 'profile.html';
    var initial  = user.name.charAt(0).toUpperCase();
    actions.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;">' +
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
        '<button class="btn-ghost" onclick="Auth.logout()" ' +
          'style="font-size:12px;padding:6px 14px;">Logout</button>' +
      '</div>';
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