import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import EkodexLogo from "../assets/images/EkodexLogo.jpg";

const Logo = ({ color = "inherit", variant = "navbar", onClick }) => {
  return (
    <Box
      component={NavLink}
      to="/"
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: {
          xs: variant === "drawer" ? "column" : "row",
          sm: "row",
        },
        alignItems: "center",
        justifyContent: {
          xs: variant === "navbar" ? "center" : "center",
          sm: "flex-start",
        },
        gap: 1,
        textDecoration: "none",
        color,
        width: "100%",
      }}
    >
      <img
        src={EkodexLogo}
        alt="logo"
        style={{
          height: 40,
        }}
      />
    </Box>
  );
};

export default Logo;
