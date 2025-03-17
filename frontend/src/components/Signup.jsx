import React, { useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import greensphereLogo from '../assets/images/greenspherelogo.png';
import greensphereImage from "../assets/images/greensphereloginsignup.png";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/signup", { name, email, password, gender })
      .then((result) => {
        if (result.status === 201) {
          console.log("User created successfully");
          navigate("/login");
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          window.alert("Email already exists. Please use another email.");
        } else {
          console.log(err);
        }
      });
  };

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        background: "linear-gradient(to right, #05002E, #191540)",
      }}
    >
      {/* Left Section */}
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <img
            src={greensphereLogo}
            alt="GreenSphere Logo"
            style={{ width: "100px" }}
          />
        </Box>
        <Paper
          elevation={3}
          sx={{
            padding: "2rem",
            borderRadius: "1rem",
            width: "100%",
            maxWidth: "400px",
            background: "#0F1238",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#FFFFFF",
              textAlign: "center",
              mb: 2,
            }}
          >
            Create an account
          </Typography>
          <Typography
            sx={{
              color: "#CCCCCC",
              textAlign: "center",
              mb: 3,
            }}
          >
            Let's get started!
          </Typography>
          <form onSubmit={handleSignup}>
            <TextField
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              type="text"
              label="Name"
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": { color: "#CCCCCC" },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "#3333FF" },
                },
              }}
            />
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              type="email"
              label="Email"
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": { color: "#CCCCCC" },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "#3333FF" },
                },
              }}
            />
            <FormControl 
              fullWidth 
              required 
              sx={{ 
                mb: 2,
                "& .MuiInputLabel-root": { color: "#CCCCCC" },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "#3333FF" },
                },
                "& .MuiSelect-icon": { color: "#CCCCCC" },
              }}
            >
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": { color: "#CCCCCC" },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "#3333FF" },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#3333FF",
                color: "#FFFFFF",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                mb: 2,
                "&:hover": { backgroundColor: "#5555FF" },
              }}
            >
              Sign up
            </Button>
          </form>
          <Typography sx={{ color: "#CCCCCC", textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              sx={{
                color: "#FFFFFF",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Log in
            </Link>
          </Typography>
        </Paper>
      </Grid>

      {/* Right Section */}
      <Grid
        item
        xs={12}
        md={7}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <img
            src={greensphereImage}
            alt="Solar Panels"
            style={{
              width: "100%",
              maxWidth: "700px",
              borderRadius: "1rem",
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup;