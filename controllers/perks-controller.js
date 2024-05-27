const pool = require("../db.config/mariadb.config");


exports.youtubePlaylist = async (req, res) => {
    const data = await req.body
    const {src , title} = data
    const width = 160
    const height = 100
    const allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    const allowFullScreen = true
let conn;
try {
    const filteredSrc = `https://www.youtube.com/embed/${src}`
    conn = await pool.getConnection();
    const query = "INSERT INTO youtube_playlist (width, height, src, allow, title, allowFullScreen) value (?, ?, ?, ?, ?, ?)";

    if(!src || !title){
        return res.status(400).json({ error: "Missing required fields: src, title" });
    }else{
        await conn.query(query, [width , height, filteredSrc, allow, title, allowFullScreen]);
    }

    return res.status(200).json({message : "data inserted successfully",data})
} catch (error) {
    res.status(500).json({ error: "An error occurred", error });
}
}

exports.getYoutubePlaylist = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "SELECT * FROM `youtube_playlist`";
        const rows = await conn.query(query);

        //NOTE - Convert numeric to boolean
        const processedRows = rows.map(row => ({
            ...row,
            allowFullScreen: row.allowFullScreen === 1
        }));

        return res.status(200).json({ youtubePlaylist: processedRows });
    } catch (error) {
        res.status(500).json({ error: "An error occurred", error });
    }
};


exports.updateYoutubePlaylist = async (req, res) => {
    const data = await req.body
    const {src , title} = data
    const width = 160
    const height = 100
    const allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    const allowFullScreen = true

    const id = req.params.id
let conn;

try {
    const filteredSrc = `https://www.youtube.com/embed/${src}`
    conn = await pool.getConnection();
    const query = "UPDATE youtube_playlist SET width = ?, height = ?, src = ?, allow = ?, title = ?, allowFullScreen = ? WHERE id = ?"; 

    if(!src || !title){
        return res.status(400).json({ error: "Missing required fields: src, title" });
    }else{
        await conn.query(query, [width , height, filteredSrc, allow, title, allowFullScreen, id]);
    }
    return res.status(200).json({message : "data updated successfully",data})
} catch (error) {
    res.status(500).json({ error: "An error occurred", error });
}
}

exports.deleteYoutubePlaylist = async (req, res) => {
    const id = req.params.id
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM youtube_playlist WHERE id = ?";
        await conn.query(query, [id]);
        return res.status(200).json({ message : "data deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred", error });
    }
}