import ChatBox from "./ChatBox.js";

export default function Footer(props) {
  const { userInfo } = props;
  return (
    <footer className="text-white">
      {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
      <div className="text-center">All rights reserved</div>
    </footer>
  );
}
