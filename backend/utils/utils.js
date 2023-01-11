import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (request, response, next) => {
  const authorization = request.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.lenght); // Removing 'Bearer '
    jwt.verify(token, process.env.JWT_SECRET, (error, decodeString) => {
      if (error) {
        response.status(401).send({ message: "Invalid Token" });
      } else {
        request.user = decodeString;
        next();
      }
    });
  } else {
    response.status(401).send({ message: "Invalid Token" });
  }
};

export const isAdmin = (request, response, next) => {
  if (request.user && request.user.isAdmin) {
    next();
  } else {
    response.status(401).send({ message: "Invalid Admin Token" });
  }
};

export const sendGridMail = async (msg) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail
    .send({
      from: process.env.SENDGRID_MAIL_DOMAIN,
      ...msg,
    })
    .then(() => {
      console.log("Email sent");
    });
};

const addressFormater = (shippingAddress) => {
  let address = "";
  const keysOrder = [
    "fullName",
    "address1",
    "address2",
    "province",
    "city",
    "country",
    "postalCode",
    "phoneNumber",
  ];

  keysOrder.forEach((key) => {
    if (shippingAddress[key]) {
      address = address.concat(shippingAddress[key], ",<br/>");
    }
  });

  return address.substring(0, address.lastIndexOf(",<br/>"));
};

export const payOrderEmailTemplate = (order) => {
  return `<h1>Thanks for shopping with us</h1>
    <p>
    Hi ${order.user.name},</p>
    <p>We have finished processing your order.</p>
    <h2>[Order <a href="${process.env.APP_HOST}/order/${order._id}">${
    order._id
  }</a>] (${order.createdAt.toString().substring(0, 10)})</h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    </thead>
    <tbody>
    ${order.orderItems
      .map(
        (item) => `
      <tr>
      <td>${item.name}</td>
      <td align="center">${item.quantity}</td>
      <td align="right"> $${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join("\n")}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2">Items Price:</td>
    <td align="right"> $${order.itemsPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2">Shipping Price:</td>
    <td align="right"> $${order.shippingPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"><strong>Total Price:</strong></td>
    <td align="right"><strong> $${order.totalPrice.toFixed(2)}</strong></td>
    </tr>
    <tr>
    <td colspan="2">Payment Method:</td>
    <td align="right">${order.paymentMethod}</td>
    </tr>
    </table>
    <h2>Shipping address</h2>
    <p>
    ${addressFormater(order.shippingAddress)}
    </p>
    <a href="${process.env.APP_HOST}/order/${
    order._id
  }">Click here to view your order details</a>
    <hr/>
    <p>
    Thanks for shopping with us.
    </p>
    `;
};
