import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import swaggerjson from "@/data/swagger.json";
const page = () => {
  return (
    <div>
      <SwaggerUI spec={swaggerjson} />
    </div>
  );
};

export default page;