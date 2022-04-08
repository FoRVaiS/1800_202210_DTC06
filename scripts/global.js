window.comidas = window.comidas || {};

(exports => {
    const auth = firebase.auth();

    /**
     * Build a Firebase fetch query.
     *
     * @param {string} collectionName Name of the collection.
     * @param {object} opts Query options.
     * @param {string} opts.document Name of the document.
     * @param {object} opts.filters Fetch filters.
     * @param {string[]} opts.filters.where Array of 'where' conditions.
     */
    exports.buildFetchQuery = function (
        collectionName = '',
        opts = {
            document: '',
            filters: {
                where: [],
            },
        },
    ) {
        const _collectionName = collectionName.trim();
        const _documentName = opts.document?.trim();

        if (!_collectionName) throw new TypeError('must provide a collectionName');

        let query = db.collection(_collectionName);

        if (_documentName) query = query.doc(_documentName);

        if (opts.filters?.where) {
            if (_documentName) throw new TypeError("can't filter a single document");

            const hasBrokenRules = opts.filters.where
                .map(rule => rule.split(' ').length)
                .filter(length => length !== 3)
                .length;

            if (hasBrokenRules) throw new RangeError('a where clause has less or greater than three keywords');

            opts.filters.where
                .map(rule => rule.split(' '))
                .forEach(rule => {
                    query = query.where(...rule);
                });
        }

        return query;
    };

    /**
     * Fetch a document snapshot from Firestore.
     *
     * @param {string} collectionName Name of the collection.
     * @param {string} document Name of the document.
     * @returns {object} A document snapshot.
     */
    exports.fetchDocument = function (collectionName, document) {
        // Read Operation
        return exports.buildFetchQuery(collectionName, { document }).get();
    };

    /**
     * Fetch multiple document snapshots from Firestore.
     *
     * @param {*} collectionName Name of a collection.
     * @param {object} filters Fetch filters.
     * @returns {object[]} An array of document snapshots.
     */
    exports.fetchDocuments = function (collectionName, filters) {
        return new Promise((resolve, reject) => {
            // Read Operation
            exports.buildFetchQuery(collectionName, { filters }).get()
                .then(snapshot => resolve(snapshot.docs))
                .catch(reject);
        });
    };

    /**
     * Fetch the current user's UID.
     *
     * @returns {Promise<string>} User UID.
     */
    exports.fetchCurrentUserId = function () {
        return new Promise((resolve, reject) => auth.onAuthStateChanged(user => {
            if (user) resolve(user.uid);
            else reject(new Error('user is not signed in'));
        }));
    };

    /**
     * Fetch a document snapshot of the current user.
     *
     * @param {string} uid User UID.
     * @returns {Promise<object>} The current user document's snapshot.
     */
    exports.fetchCurrentUserDocument = function (uid = '') {
        return new Promise((resolve, reject) => {
            if (uid) return resolve(exports.fetchDocument('users', uid));

            return exports.fetchCurrentUserId()
                .then(id => resolve(exports.fetchDocument('users', id)))
                .catch(reject);
        });
    };

    /**
     * Fetch parameters from url search section.
     *
     * @returns {{ [index: string]: string; }[]}
     */
    exports.readUrlParams = function () {
        const paramString = window.location.search.substring(1);

        if (paramString === '') return {};

        return Object.fromEntries(paramString
            .split('&')
            .map(param => param.split('=')));
    };
})(window.comidas.exports = window.comidas.exports || {});

(async () => {
    const { fetchCurrentUserId } = window.comidas.exports;

    // Load partials.
    $('nav.navbar').load('../_partials/header.html', async () => {
        Array.from(document.querySelectorAll('nav.navbar .nav-link'))
            .filter(link => link.textContent.toLowerCase() === 'profile')
            .pop()
            .setAttribute('href', `../profile/profile.html?id=${await fetchCurrentUserId()}`)
    });
    $('footer.footer').load('../_partials/footer.html');

    // Redirect VISITORS to login.html if they're attempting to access a page for logged-in users.
    try {
        const filename = (new URL(window.location.href)).pathname.split('/').pop();
        if (filename !== 'index.html' && filename !== 'login.html') await fetchCurrentUserId();
    } catch (e) {
        window.location.assign('../login/login.html');
    }

    // Show navbar items if you're logged in, hide if you're a visitor.
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            $(".nav-item").show()
        } else {
            $(".nav-item").hide()
        }
    });
})();