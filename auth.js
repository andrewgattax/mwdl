import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function getSpotifyToken() {
    var client_id = process.env.CLIENT_ID;
    var client_secret = process.env.CLIENT_SECRET;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
    };

    try {
        const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
        if (response.status === 200) {
            const token = response.data.access_token;
            return token;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

const spotifyToken = await getSpotifyToken();
export { spotifyToken };
