import React from "react";
import LoadingBar from "react-top-loading-bar";
import apiClient from "../components/ApiClient";

export default function TopBar() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    apiClient.interceptors.request.use(
      (config) => {
        if (ref?.current) {
          ref.current.continuousStart();
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    apiClient.interceptors.response.use(
      (response) => {
        if (ref?.current) {
          ref.current.complete();
        }
        return response;
      },
      (error) => {
        if (ref?.current) {
          ref.current.complete();
        }
        return Promise.reject(error);
      }
    );
  });

  return (
    <LoadingBar
      color="#f11946"
      ref={ref}
      className="progress-bar"
      containerStyle={{ position: "relative" }}
      shadow={false}
    />
  );
}
