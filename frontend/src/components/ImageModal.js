import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

export default function ImageModal(props) {
  const listOfSrcImages = Array.isArray(props.imagesSrc)
    ? props.imagesSrc
    : [props.imagesSrc];
  const [index, setIndex] = useState(
    props.index && Array.isArray(props.imagesSrc) ? props.index : 0
  );
  const [currentImage, setCurrentImage] = useState(listOfSrcImages[index]);

  useEffect(() => {
    const eventHandler = (event) => {
      if (event.key === "ArrowLeft") {
        handelRotationRight();
      } else if (event.key === "ArrowRight") {
        handelRotationLeft();
      } else if (event.key === "Escape") {
        props.setShowModal(false);
      }
    };
    document.addEventListener("keydown", eventHandler);
    return () => {
      document.removeEventListener("keydown", eventHandler);
    };
  });

  const handleClick = (event) => {
    if (event.target.classList.contains("dismiss")) {
      props.setShowModal(false);
    }
  };

  const handelRotationRight = () => {
    if (index + 1 >= listOfSrcImages.length) {
      setCurrentImage(listOfSrcImages[0]);
      setIndex(0);
      return;
    }
    setCurrentImage(listOfSrcImages[index + 1]);
    setIndex(index + 1);
  };

  const handelRotationLeft = () => {
    if (index === 0) {
      setCurrentImage(listOfSrcImages[listOfSrcImages.length - 1]);
      setIndex(listOfSrcImages.length - 1);
      return;
    }
    setCurrentImage(listOfSrcImages[index - 1]);
    setIndex(index - 1);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handelRotationLeft(),
    onSwipedRight: () => handelRotationRight(),
  });

  return (
    <>
      <div {...swipeHandlers} className="overlay dismiss" onClick={handleClick}>
        <img src={currentImage} alt="bigger pic" />
        <i
          className="dismiss dismiss-button fa-solid fa-circle-xmark"
          onClick={handleClick}
        />
        {listOfSrcImages.length > 1 && (
          <>
            <i
              onClick={handelRotationLeft}
              className="overlay-arrows_left fa-solid fa-circle-arrow-left"
            />
            <i
              onClick={handelRotationRight}
              className="overlay-arrows_right fa-solid fa-circle-arrow-right"
            />
          </>
        )}
      </div>
    </>
  );
}
