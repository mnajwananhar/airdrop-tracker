import mysql from "mysql2/promise";

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: "localhost",
  user: process.env.DB_USER || "root", // Default to "root" if environment variable not set
  password: process.env.DB_PASSWORD || "", // Default to empty password if environment variable not set
  database: "airdrop_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize the database (create if it doesn't exist)
export async function initializeDatabase() {
  try {
    // First, create a connection without specifying a database
    const tempPool = mysql.createPool({
      host: "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    // Create the database if it doesn't exist
    await tempPool.query("CREATE DATABASE IF NOT EXISTS airdrop_tracker");

    // Close the temporary connection
    await tempPool.end();

    // Now connect to the database and create the table if it doesn't exist
    const connection = await pool.getConnection();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS projects (
        id BIGINT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        notes TEXT,
        links TEXT,
        types TEXT,
        completed BOOLEAN DEFAULT false,
        dateAdded DATETIME,
        dateCompleted DATETIME
      )
    `;
    await connection.query(createTableQuery);

    connection.release();
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

// Safely parse JSON data
export function safeJSONParse(jsonString, defaultValue) {
  if (!jsonString || jsonString === "") return defaultValue;

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse error:", err);
    return defaultValue;
  }
}

// Get all projects
export async function getAllProjects() {
  try {
    const [rows] = await pool.query("SELECT * FROM projects");

    // Parse JSON strings with robust error handling
    const projects = rows.map((project) => ({
      ...project,
      links: safeJSONParse(project.links, []),
      types: safeJSONParse(project.types, ["daily"]),
    }));

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects: " + error.message);
  }
}

// Get a single project by ID
export async function getProjectById(id) {
  try {
    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return null;
    }

    const project = rows[0];
    return {
      ...project,
      links: safeJSONParse(project.links, []),
      types: safeJSONParse(project.types, ["daily"]),
    };
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw new Error(`Failed to fetch project: ${error.message}`);
  }
}

// Create a new project
export async function createProject(project) {
  try {
    const { id, name, notes, links, types, completed, dateAdded } = project;

    if (!name) {
      throw new Error("Project name is required");
    }

    const formattedDate = dateAdded
      ? new Date(dateAdded).toISOString().slice(0, 19).replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " ");

    // Safely stringify JSON data
    let linksString, typesString;

    try {
      linksString = Array.isArray(links)
        ? JSON.stringify(links)
        : JSON.stringify([]);
    } catch (error) {
      console.error("Error stringifying links:", error);
      linksString = "[]";
    }

    try {
      typesString = Array.isArray(types)
        ? JSON.stringify(types)
        : JSON.stringify(["daily"]);
    } catch (error) {
      console.error("Error stringifying types:", error);
      typesString = '["daily"]';
    }

    const projectId = id || Date.now();

    const query =
      "INSERT INTO projects (id, name, notes, links, types, completed, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await pool.query(query, [
      projectId,
      name,
      notes || null,
      linksString,
      typesString,
      completed || false,
      formattedDate,
    ]);

    return projectId;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project: " + error.message);
  }
}

// Update a project
export async function updateProject(id, project) {
  try {
    const { name, notes, links, types, completed, dateCompleted } = project;

    if (!name) {
      throw new Error("Project name is required");
    }

    const formattedCompletedDate = dateCompleted
      ? new Date(dateCompleted).toISOString().slice(0, 19).replace("T", " ")
      : null;

    // Safely stringify JSON data
    let linksString, typesString;

    try {
      linksString = Array.isArray(links)
        ? JSON.stringify(links)
        : JSON.stringify([]);
    } catch (error) {
      console.error("Error stringifying links:", error);
      linksString = "[]";
    }

    try {
      typesString = Array.isArray(types)
        ? JSON.stringify(types)
        : JSON.stringify(["daily"]);
    } catch (error) {
      console.error("Error stringifying types:", error);
      typesString = '["daily"]';
    }

    const query = `
      UPDATE projects 
      SET name = ?, notes = ?, links = ?, types = ?, completed = ?, dateCompleted = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      name,
      notes || null,
      linksString,
      typesString,
      completed || false,
      formattedCompletedDate,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Project not found");
    }

    return true;
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw new Error("Failed to update project: " + error.message);
  }
}

// Delete a project
export async function deleteProject(id) {
  try {
    const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Project not found");
    }

    return true;
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw new Error("Failed to delete project: " + error.message);
  }
}
