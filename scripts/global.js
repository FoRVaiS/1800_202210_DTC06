window.comidas = window.comidas || {};

(exports => {
    const auth = firebase.auth();

    exports.buildFetchQuery = function(
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

    exports.fetchDocument = function(collectionName, document) {
        return exports.buildFetchQuery(collectionName, { document }).get();
    };

    exports.fetchDocuments = function(collectionName, filters) {
        return new Promise((resolve, reject) => {
            exports.buildFetchQuery(collectionName, { filters }).get()
                .then(snapshot => resolve(snapshot.docs))
                .catch(reject);
        });
    };

    exports.fetchCurrentUserId = function() {
        return new Promise((resolve, reject) => auth.onAuthStateChanged(user => {
            if (user) resolve(user.uid);
            else reject(new Error('user is not signed in'));
        }));
    };

    exports.fetchCurrentUserDocument = function(uid = '') {
        return new Promise((resolve, reject) => {
            if (uid) return resolve(exports.fetchDocument('users', uid));

            return exports.fetchCurrentUserId()
                .then(id => resolve(exports.fetchDocument('users', id)))
                .catch(reject);
        });
    };

    exports.readUrlParams = function() {
        const paramString = window.location.search.substring(1);

        if (paramString === '') return {};

        return Object.fromEntries(paramString
            .split('&')
            .map(param => param.split('=')));
    };
})(window.comidas.exports = window.comidas.exports || {});

(async() => {
    $('nav.navbar').load('../_partials/header.html');
    $('footer.footer').load('../_partials/footer.html');

    const { fetchCurrentUserId } = window.comidas.exports;

    try {
        await fetchCurrentUserId();

        document.querySelector('.navbar__profile').setAttribute('data-signed-in', true);
    } catch (e) {
        console.error(e);
    }
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            $(".navbar__items").show()
        } else {
            $(".navbar__items").hide()
        }
    });
})();