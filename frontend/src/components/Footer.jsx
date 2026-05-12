import { Box, Grid, Typography, Link, Stack, useTheme } from "@mui/material";

import { Link as RouterLink } from "react-router-dom";

// Icons
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import GavelIcon from "@mui/icons-material/Gavel";
import ContactMailIcon from "@mui/icons-material/ContactMail";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        p: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: theme.palette.primary.dark,
        color: theme.palette.background.paper,
      }}
    >
      {/* TOP SECTION */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-around"
        spacing={4}
        p={{ xs: 3, sm: 2 }}
      >
        {/* PRODUCT */}
        <Grid>
          <Typography fontWeight={600} mb={2} fontSize={24}>
            Product
          </Typography>

          <FooterLink to="/" icon={<DashboardIcon />}>
            Templates
          </FooterLink>

          <FooterLink to="/login" icon={<EditIcon />}>
            Editor
          </FooterLink>

          <FooterLink to="/pricing" icon={<LocalOfferIcon />}>
            Pricing
          </FooterLink>
        </Grid>

        {/* CUSTOMER CARE */}
        <Grid>
          <Typography fontWeight={600} mb={2} fontSize={24}>
            Customer Care
          </Typography>

          <FooterLink to="/privacy" icon={<PrivacyTipIcon />}>
            Privacy Policy
          </FooterLink>

          <FooterLink to="/terms-and-conditions" icon={<GavelIcon />}>
            Terms & Conditions
          </FooterLink>

          <FooterLink to="/contact-us" icon={<ContactMailIcon />}>
            Contact Us
          </FooterLink>
        </Grid>

        {/* AUTH */}
        <Grid>
          <Typography fontWeight={600} mb={2} fontSize={24}>
            Get Started
          </Typography>

          <FooterLink to="/login" icon={<LoginIcon />}>
            Login
          </FooterLink>

          <FooterLink to="/register" icon={<PersonAddIcon />}>
            Create Account
          </FooterLink>
        </Grid>
      </Stack>

      {/* BOTTOM */}
      <Box
        sx={{
          py: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;

/* =======================
   LINK COMPONENT (FIXED)
======================= */
const FooterLink = ({ to, icon, children }) => {
  const theme = useTheme();

  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: 18,
        mb: 1,
        color: theme.palette.background.paper,
        opacity: 0.85,
        transition: "0.2s",
        "&:hover": {
          opacity: 1,
          transform: "translateX(4px)",
        },
      }}
    >
      {icon}
      {children}
    </Link>
  );
};
