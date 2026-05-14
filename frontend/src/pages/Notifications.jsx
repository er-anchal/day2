import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await triggerBirthdayCheck();
      await fetchNotifications();
    };
    init();
  }, []);

  // Ask backend to create birthday notification if applicable
  const triggerBirthdayCheck = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/check-birthday`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Birthday check error", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsNoneIcon fontSize="large" color="primary" />
          <Typography variant="h4" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button variant="outlined" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <Box key={notif._id}>
                <ListItem
                  sx={{
                    bgcolor: notif.isRead
                      ? "transparent"
                      : notif.type === "BIRTHDAY"
                      ? "rgba(255, 152, 0, 0.08)"
                      : "action.hover",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                    px: 3,
                    gap: 2,
                  }}
                >
                  {/* Icon by type */}
                  <Box sx={{ flexShrink: 0 }}>
                    {notif.type === "BIRTHDAY" ? (
                      <CakeIcon sx={{ color: "#ff9800", fontSize: 28 }} />
                    ) : (
                      <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 26 }} />
                    )}
                  </Box>

                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography
                          variant="body1"
                          fontWeight={notif.isRead ? "normal" : "bold"}
                        >
                          {notif.message}
                        </Typography>
                        <Chip
                          label={notif.type}
                          size="small"
                          color={notif.type === "BIRTHDAY" ? "warning" : "default"}
                          variant={notif.isRead ? "outlined" : "filled"}
                        />
                      </Box>
                    }
                    secondary={new Date(notif.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />

                  {!notif.isRead && (
                    <Button
                      size="small"
                      variant="contained"
                      color={notif.type === "BIRTHDAY" ? "warning" : "primary"}
                      onClick={() => markAsRead(notif._id)}
                      sx={{ flexShrink: 0 }}
                    >
                      Mark Read
                    </Button>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;
