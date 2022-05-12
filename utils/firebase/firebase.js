import admin from 'firebase-admin';

try {
	admin.initializeApp({
		credential: admin.credential.cert({
			project_id: process.env.FIREBASE_PROJECT_ID,
			private_key: process.env.FIREBASE_PRIVATE_KEY,
			client_email: process.env.FIREBASE_CLIENT_EMAIL
		}),
		databaseURL: process.env.FIREBASE_CLIENT_DB_URL,
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET
	});
} catch (error) {
	/*
	 * We skip the "already exists" message which is
	 * not an actual error when we're hot-reloading.
	 */
	if (!/already exists/u.test(error.message)) {
		// eslint-disable-next-line no-console
		console.error('Firebase admin initialization error', error.stack);
	}
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage().bucket();

const collection = firestore.collection('');

export const getPresignedUrl = async (_file, folder, userId) => {
	const file = storage.file(`${folder}/${_file}`);
	const validMinutes = 1; //  1 minute
	const options = {
		expires: Date.now() + validMinutes * 60 * 1000,
	};
	if (userId){
		options.fields = { 'x-goog-meta-user': userId };
	}
	const [response] = await file.generateSignedPostPolicyV4(options);
	return response;

};

export const getDownloadableUrl = (path) => {
	return `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}}/o/${path.split('/').join('%2F')}?alt=media`;
};

export const listFiles = async () => {
	return storage.getFiles();
};

export const addToCollection = async (data) => {
	const ref = await collection.add(data);
	return ref.id;
};

export const updateInCollection = async (id, data) => {
	await collection.doc(`${id}`).update(data);
};

export const setInCollection = async (id, data) => {
	await collection.doc(`${id}`).set(data);
};

export const deleteFromCollection = async (id) => {
	await collection.doc(`${id}`).delete();
};

export const getFromCollection = async () => {
	const { docs } = await collection.limit(1).get();
	return Promise.all(docs.map(item => {
		if (!item.exists) return;
		return item.data();
	}))
};

export const getPaginatedFromCollection = async (amount = 50, cursor) => {
	let items;
	if (cursor) {
		items = await collection.orderBy('id', 'desc').startAt(cursor).limit(amount).get();
	} else {
		items = await collection.orderBy('id', 'desc').limit(amount).get();
	}
	return Promise.all(items.docs.map(item => item.data()));
}

/*
methods on collection:
 .orderBy('date', 'desc')
 .orderBy('date', 'asc')
 .limit(amount)
 .where('date', '>', start)

attributes on QuerySnapshot
 .size
 .exists
 .data()

transform date after get()
	.toDate().toISOString()


*/


export const verifyIdToken = async (token) => {
	try{
		const { uid } = await auth.verifyIdToken(token);
		return await auth.getUser(uid);
	}catch(error){
		throw error;
	}
}








