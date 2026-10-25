/*
This route returns the prototype's reproducible mock-pair evaluation results.
It relies only on the JSON examples stored in the project.
*/

import { getEvaluation } from "../../../lib/evaluation";

/** Handle GET /api/evaluate and convert data errors into a readable response. */
export async function GET() {
  try {
    return Response.json(getEvaluation());
  } catch (error) {
    const message = error && error.message ? error.message : "An unexpected error occurred while calculating the evaluation.";
    return Response.json({ error: message }, { status: 500 });
  }
}
