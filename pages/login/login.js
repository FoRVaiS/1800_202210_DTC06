// Initialize the FirebaseUI Widget using Firebase.
(() => {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());

    const redirectUrl = '../main/main.html';

    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: async function(authResult) {
                try {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    const user = authResult.user; // get the user object info
                    const userDoc = db.collection('users').doc(user.uid);

                    if (authResult.additionalUserInfo.isNewUser) {
                        await userDoc.set({
                            name: user.displayName,
                            email: user.email,
                        })
                        window.location.assign('../user_selection/user_selection.html?redirect='+redirectUrl);
                    } else {
                        const snapshot = await userDoc.get();
                        const data = snapshot.data();

                        if (!data.type || !data.userType) window.location.assign('../user_selection/user_selection.html?redirect='+redirectUrl);

                        if (data.type.length > 0 && data.userType.length > 0) {
                            return true;
                        } else {
                            window.location.assign('../user_selection/user_selection.html?redirect='+redirectUrl);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            uiShown: function() {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: redirectUrl,
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    ui.start('#firebaseui-auth-container', uiConfig);
})();
