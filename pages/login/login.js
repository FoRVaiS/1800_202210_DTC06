// Initialize the FirebaseUI Widget using Firebase.
(() => {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());

    const redirectUrl = '../main/main.html';

    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult) {
                try {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    const { user } = authResult; // get the user object info
                    const userDoc = db.collection('users').doc(user.uid);

                    if (authResult.additionalUserInfo.isNewUser) {
                        userDoc.set({
                            name: user.displayName,
                            email: user.email,
                        }).then(() => {
                            window.location.assign(`../user_selection/user_selection.html?redirect=${redirectUrl}`);
                        });
                    } else {
                        userDoc.get().then(snapshot => {
                            const data = snapshot.data();

                            if ((!data.type || !data.userType) || (data.type.length <= 0 || data.userType.length <= 0)) {
                                return window.location.assign(`../user_selection/user_selection.html?redirect=${redirectUrl}`);
                            }

                            return window.location.assign(redirectUrl);
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            uiShown: function() {
                // The widget is rendered.
                // Hide the loader.
                // document.getElementById('loader').style.display = 'none';
            },
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: redirectUrl,
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>',
    };

    ui.start('#firebaseui-auth-container', uiConfig);
})();