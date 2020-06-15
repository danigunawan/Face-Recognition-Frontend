import React from "react";
import Grid from "@material-ui/core/Grid";
import { RegistrationContextProvider } from "../../components/contexts/RegistrationContext";
import RegistrationCard from "./elements/RegistrationCard";
import WebcamComponent from "./elements/Webcam";
import ApiStatus from "./elements/ApiStatus";

export default function HomeView() {
  return (
    <RegistrationContextProvider>
      <ApiStatus />
      <Grid container direction="column" alignItems="center" spacing={2}>
        <RegistrationCard />
        <WebcamComponent />
      </Grid>
    </RegistrationContextProvider>
  );
}
