import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import CheckoutSteps from "../components/CheckoutSteps.js";
import { toast } from "react-hot-toast";
import GoogleMapModal from "../components/GoogleMapModal";

export default function ShippingAddressView() {
  const navigateTo = useNavigate();
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    shippingAddress.phoneNumber || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [address1, setAddress1] = useState(shippingAddress.address1 || "");
  const [address2, setAddress2] = useState(shippingAddress.address2 || "");
  const [province, setProvince] = useState(shippingAddress.province || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [location, setLocation] = useState(null);

  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigateTo("/signin?redirect=/shipping");
    }
    if (shippingAddress && shippingAddress.location) {
      setLocation(shippingAddress.location);
    }
  }, [userInfo, navigateTo, contextDispatch, shippingAddress]);

  const handleShowMapModal = () => setShowMapModal(true);
  const handleCloseMapModal = () => setShowMapModal(false);

  const getAddressComponentByType = (addresComponents, type) => {
    if (!addresComponents) {
      return "";
    }
    const component = addresComponents.find((component) => {
      return component.types.find((componentType) => componentType === type);
    });
    return component ? component.long_name : "";
  };

  const confirmMap = () => {
    const place = location.place;
    setCountry(getAddressComponentByType(place.address_components, "country"));
    setCity(
      getAddressComponentByType(
        place.address_components,
        "administrative_area_level_2"
      )
    );
    setProvince(
      getAddressComponentByType(
        place.address_components,
        "administrative_area_level_1"
      )
    );
    setAddress1(
      place.formatted_address.substring(0, place.formatted_address.indexOf(","))
    );
    handleCloseMapModal();
    toast.success("location selected successfully.");
  };

  const handleOnExitingModal = () => {
    return;
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    let payload = {
      fullName,
      phoneNumber,
      country,
      city,
      address1,
      address2,
      province,
      postalCode,
    };
    if (location) {
      let payloadLocation = {
        lat: location.lat,
        lng: location.lng,
        searchedLocation: location.searchedLocation,
      };
      if (location.place) {
        payloadLocation = {
          ...payloadLocation,
          place: {
            formatted_address: location.place.formatted_address,
            name: location.place.name,
            vicinity: location.place.vicinity,
            place_id: location.place.place_id,
            address_components: location.place.address_components,
          },
        };
      }
      payload = {
        ...payload,
        location: payloadLocation,
      };
    }
    contextDispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: payload,
    });
    navigateTo("/payment");
  };

  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2 />
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="my-3">Shipping Address</h1>
          <div>
            <Button
              id="chooseOnMap"
              typeof="button"
              variant="light"
              onClick={handleShowMapModal}
            >
              Select on Map
            </Button>
          </div>
        </div>

        <Form onSubmit={submitHandler}>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="fullName">
                <FloatingLabel label="Full Name*">
                  <Form.Control
                    placeholder="."
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="phoneNumber*">
                <FloatingLabel label="Phone Number*">
                  <Form.Control
                    placeholder="."
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="country">
                <FloatingLabel label="Country*">
                  <Form.Control
                    placeholder="."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="city">
                <FloatingLabel label="City*">
                  <Form.Control
                    placeholder="."
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="address1">
            <FloatingLabel label="Address Line 1* (Street, Address, Company Name, C/O)">
              <Form.Control
                placeholder="."
                value={address1}
                onChange={(event) => setAddress1(event.target.value)}
                required
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group className="mb-3" controlId="address2">
            <FloatingLabel label="Address Line 2 (Apartment, Floor, Suite, Unit, Building, etc.)">
              <Form.Control
                placeholder="."
                value={address2}
                onChange={(event) => setAddress2(event.target.value)}
              />
            </FloatingLabel>
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="province">
                <FloatingLabel label="Province/State*">
                  <Form.Control
                    placeholder="."
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="postalCode">
                <FloatingLabel label="Post/Zip Code">
                  <Form.Control
                    placeholder="."
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
      <GoogleMapModal
        showMapModal={showMapModal}
        handleOnExitingModal={handleOnExitingModal}
        confirmMap={confirmMap}
        location={location}
        setLocation={setLocation}
        handleCloseMapModal={handleCloseMapModal}
      />
    </div>
  );
}
