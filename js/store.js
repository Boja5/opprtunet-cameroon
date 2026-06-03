// ═══════════════════════════════════════
// OpportuNet Cameroon — Central Data Store
// All pages import from here to get
// consistent data across the whole platform
// ═══════════════════════════════════════

var OpportuNet = {
  // ── State ──────────────────────────────
  loaded:       false,
  listings:     [],   // All opportunities (static + Firebase)
  companies:    [],   // All companies (static + Firebase)
  people:       [],   // All people (static + Firebase)
  firebaseListings:  [], // Only Firebase listings
  firebaseCompanies: [], // Only Firebase company accounts
  firebasePeople:    [], // Only Firebase youth accounts

  // ── Load everything from Firebase ──────
  load: async function() {
    if (this.loaded) return this; // Don't load twice

    // Start with static data
    this.listings  = OPPORTUNITIES.slice();
    this.companies = COMPANIES.slice();
    this.people    = PEOPLE.slice();

    try {
      // Dynamically import Firebase functions
      const fb = await import('./firebase.js');

      // ── Load Firebase listings ──────────
      try {
        var snap = await fb.firebaseGetAllListings();
        // firebaseGetAllListings returns static + Firebase combined
        // We only want the Firebase ones (those with string IDs)
        this.firebaseListings = snap.filter(function(l) {
          return typeof l.id === 'string' && isNaN(parseInt(l.id));
        });
        // Combined = static + Firebase
        this.listings = OPPORTUNITIES.concat(this.firebaseListings);
      } catch(e) {
        console.log('Listings load error:', e);
      }

      // ── Load Firebase company accounts ──
      try {
        this.firebaseCompanies = await fb.firebaseGetCompanies();
        // Merge with static — avoid duplicates by name
        var staticNames = COMPANIES.map(function(c) {
          return c.name.toLowerCase();
        });
        var newCompanies = this.firebaseCompanies.map(function(fc) {
          return {
            id:          fc.id,
            name:        fc.name,
            short:       fc.name ? fc.name.substring(0, 2).toUpperCase() : 'CO',
            type:        fc.companyType        || 'Private Company',
            region:      fc.companyRegion      || 'Cameroon',
            city:        fc.companyRegion      || 'Cameroon',
            sector:      'Various',
            description: fc.companyDescription || 'No description provided yet.',
            website:     fc.companyWebsite     || '',
            email:       fc.email              || '',
            founded:     fc.createdAt ? new Date(fc.createdAt).getFullYear().toString() : '2026',
            employees:   'N/A',
            listings:    [], // Will be filled below
            isFirebase:  true,
            firebaseId:  fc.id
          };
        });
        this.companies = COMPANIES.concat(newCompanies);
      } catch(e) {
        console.log('Companies load error:', e);
      }

      // ── Load Firebase youth accounts ────
      try {
        this.firebasePeople = await fb.firebaseGetPeople();
        var newPeople = this.firebasePeople.map(function(fp) {
          return {
            id:         fp.id,
            name:       fp.name,
            initial:    fp.name ? fp.name.charAt(0).toUpperCase() : 'U',
            region:     fp.region     || 'Cameroon',
            city:       fp.region     || 'Cameroon',
            bio:        fp.bio        || 'No bio added yet.',
            skills:     fp.skills     || [],
            education:  fp.education  || [],
            experience: fp.experience || [],
            isFirebase: true
          };
        });
        this.people = PEOPLE.concat(newPeople);
      } catch(e) {
        console.log('People load error:', e);
      }

      // ── Link listings to companies ──────
      // For each listing, find the company that posted it
      // and add the listing ID to that company's listings array
      var self = this;
      this.firebaseListings.forEach(function(listing) {
        if (!listing.postedBy) return;
        // Find the Firebase company that posted this listing
        var company = self.companies.find(function(c) {
          return c.firebaseId === listing.postedBy ||
                 c.id         === listing.postedBy;
        });
        if (company) {
          if (!company.listings) company.listings = [];
          // Add listing ID if not already there
          if (company.listings.indexOf(listing.id) === -1) {
            company.listings.push(listing.id);
          }
        }
      });

    } catch(e) {
      console.log('Firebase import error — using static data only:', e);
    }

    this.loaded = true;
    return this;
  },

  // ── Helper: get listing by ID ───────────
  getListingById: function(id) {
    return this.listings.find(function(l) {
      return String(l.id) === String(id);
    });
  },

  // ── Helper: get company by ID ───────────
  getCompanyById: function(id) {
    return this.companies.find(function(c) {
      return String(c.id) === String(id) ||
             String(c.firebaseId) === String(id);
    });
  },

  // ── Helper: get listings for a company ──
  getListingsForCompany: function(companyId) {
    return this.listings.filter(function(l) {
      return l.postedBy === companyId ||
        (l.organization && l.organization === companyId);
    });
  }
};