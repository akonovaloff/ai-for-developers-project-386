import "@typespec/http";
import "@typespec/openapi3";
import "./models.tsp";
import "./routes/guest.tsp";
import "./routes/admin.tsp";

using TypeSpec.Http;

@service({
  title: "CalBook — Booking Service API",
})
@server("http://localhost:8000", "Local development")
namespace CalBook;
