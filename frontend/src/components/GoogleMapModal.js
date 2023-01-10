import { Button, Modal } from "react-bootstrap";
import MessageBox from "./MessageBox";
import Map from "../components/Map";
import { useEffect, useReducer, useState } from "react";
import apiClient from "../components/ApiClient";
import { getError } from "../utils/utils";
import LoadingBox from "./LoadingBox";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_API_MAPS":
      return { ...state, loadingMapsApi: true, errorMapsApi: null };
    case "FETCH_API_MAPS_SUCCESS":
      return {
        ...state,
        loadingMapsApi: false,
        errorMapsApi: null,
      };
    case "FETCH_API_MAPS_FAIL":
      return { ...state, loadingMapsApi: false, errorMapsApi: action.payload };
    default:
      return state;
  }
}

export default function GoogleMapModal({
  showMapModal,
  handleOnExitingModal,
  confirmMap,
  location,
  setLocation,
  handleCloseMapModal,
}) {
  const [{ loadingMapsApi, errorMapsApi }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const [googleApiKey, setGoogleApiKey] = useState(null);

  useEffect(() => {
    const fecthApiKey = async () => {
      try {
        dispatch({ type: "FETCH_API_MAPS" });
        if (!googleApiKey) {
          const { data } = await apiClient.get("/api/keys/google");
          setGoogleApiKey(data);
        }
        dispatch({ type: "FETCH_API_MAPS_SUCCESS" });
      } catch (error) {
        dispatch({ type: "FETCH_API_MAPS_FAIL", payload: getError(error) });
      }
    };
    fecthApiKey();
  }, [googleApiKey]);

  return loadingMapsApi ? (
    <LoadingBox />
  ) : (
    <Modal
      show={showMapModal}
      fullscreen={true}
      keyboard={false}
      backdrop="static"
      onExiting={handleOnExitingModal}
    >
      <Modal.Header>
        <Modal.Title>Map</Modal.Title>
        <div>
          {confirmMap && (
            <Button
              variant="primary"
              type="button"
              onClick={confirmMap}
              disabled={location != null && location.place == null}
            >
              Confirm
            </Button>
          )}

          <Button
            className="ms-2"
            variant="secondary"
            onClick={handleCloseMapModal}
          >
            Back
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        {errorMapsApi ? (
          <MessageBox variant="danger">{errorMapsApi}</MessageBox>
        ) : (
          <Map
            className="map-view"
            apiKey={googleApiKey}
            location={location}
            setLocation={setLocation}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
