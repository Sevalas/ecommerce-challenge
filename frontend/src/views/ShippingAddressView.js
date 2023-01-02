import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState, useReducer } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import CheckoutSteps from "../components/CheckoutSteps.js";
import Map from "../components/Map";
import apiClient from "../components/ApiClient";
import LoadingBox from "../components/LoadingBox";
import { getError } from "../utils/utils";
import MessageBox from "../components/MessageBox";
import { toast } from "react-hot-toast";

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

export default function ShippingAddressView() {
  const navigateTo = useNavigate();
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [{ loadingMapsApi, errorMapsApi }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState(null);
  const [location, setLocation] = useState(null);
  const [searchBox, setSearchBox] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigateTo("/signin?redirect=/shipping");
    }
    contextDispatch({ type: "SET_FULLBOX_OF" });
  }, [userInfo, navigateTo, contextDispatch]);

  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const submitHandler = async (event) => {
    event.preventDefault();
    contextDispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });
    navigateTo("/payment");
  };

  const handleShowMapModal = async () => {
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
    setShowMapModal(true);
  };
  const handleCloseMapModal = () => setShowMapModal(false);

  const confirmMap = () => {
    const places = searchBox.getPlaces() || [{}];
    contextDispatch({
      type: "SAVE_SHIPPING_ADDRESS_MAP_LOCATION",
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    handleCloseMapModal();
    toast.success("location selected successfully.");
  };

  return (
    <>
      <div>
        <Helmet>
          <title>Shipping Address</title>
        </Helmet>
        <CheckoutSteps step1 step2 />
        <div className="container small-container">
          <h1 className="my-3">Shipping Address</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="postalCode">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="country">
              <Form.Label>Country</Form.Label>
              <Form.Control
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button variant="primary" type="submit">
                Continue
              </Button>
            </div>
            <div className="mb-3">
              <Button
                id="chooseOnMap"
                typeof="button"
                variant="light"
                onClick={handleShowMapModal}
              >
                Choose Location on Map
              </Button>
              {shippingAddress.location && shippingAddress.location.lat ? (
                <div>
                  LAT: {shippingAddress.location.lat}
                  LNG: {shippingAddress.location.lng}
                </div>
              ) : (
                <div>No Location</div>
              )}
            </div>
          </Form>
        </div>
      </div>

      {loadingMapsApi ? (
        <LoadingBox />
      ) : (
        <Modal
          show={showMapModal}
          fullscreen={true}
          keyboard={false}
          backdrop="static"
        >
          <Form onSubmit={submitHandler}>
            <Modal.Header>
              <Modal.Title>Map</Modal.Title>
              <div>
                <Button variant="primary" type="button" onClick={confirmMap}>
                  Confirm
                </Button>
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
                  searchBox={searchBox}
                  setSearchBox={setSearchBox}
                />
              )}
            </Modal.Body>
          </Form>
        </Modal>
      )}
    </>
  );
}
