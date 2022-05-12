import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

const config = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_DB_URL,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

export default function initFirebase() {
	if (!firebase.apps.length) {
		firebase.initializeApp(config)
	}
}


