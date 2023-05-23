import express, { Request, Response } from "express";
import axios from "axios";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/currently-playing", async (req: Request, res: Response) => {
  try {
    // Replace with your Spotify app credentials
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    // Encode the credentials in base64
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    // Request access token
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const { data } = await axios.post(
      "https://accounts.spotify.com/api/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    // Get the access token
    const accessToken = data.access_token;

    // Get the currently playing track
    const { data: trackData } = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Extract the song name and artist from the response
    const songName = trackData.item.name;
    const artist = trackData.item.artists
      .map((artist: any) => artist.name)
      .join(", ");

    // Send the response
    console.log({ songName, artist });
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
