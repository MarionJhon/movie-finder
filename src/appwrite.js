import { Client, TablesDB, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint("https://syd.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tables = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // Use listRows instead of listDocuments
    const result = await tables.listRows(DATABASE_ID, TABLE_ID, [
      Query.equal("searchTerm", searchTerm),
      Query.limit(1), // only need one row
    ]);

    if (result.total > 0) {
      const row = result.rows[0];

      await tables.updateRow(DATABASE_ID, TABLE_ID, row.$id, {
        count: row.count + 1,
      });
    } else {
      await tables.createRow(DATABASE_ID, TABLE_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (e) {
    console.error("Error updating search count:", e);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await tables.listRows(DATABASE_ID, TABLE_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
