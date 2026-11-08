// A module's contract (README.md, Contracts): its schema and the test vectors beside it, values the
// schema must accept and values it must reject. The vectors are Json so that another language can run them too.

import { type Json, type QiError, type Result, result } from "@qi/base";
import type { z } from "zod";
import { type DecodeError, decode } from "./decode.ts";

export type Vectors = { readonly accept: readonly Json[]; readonly reject: readonly Json[] };

export type Contract<S extends z.ZodType> = {
  readonly name: string;
  readonly schema: S;
  readonly vectors: Vectors;
};

// A contract that disagrees with its vectors: which ones, by index, in the context (wrongly decided, or thrown on).
export type ContractError = QiError<"CONTRACT", "VALIDATION">;

// A vector must be decided by the schema: one it throws on counts against the contract on either side.
export const verify = <S extends z.ZodType>(contract: Contract<S>): Result<Contract<S>, ContractError> => {
  const outcome = (v: Json): "accept" | "reject" | "threw" =>
    result.match(
      () => "accept" as const,
      (e: DecodeError) => (e.code === "DECODE" ? ("reject" as const) : ("threw" as const)),
    )(decode(contract.schema)(v));
  const wrong = (vectors: readonly Json[], expected: "accept" | "reject"): readonly number[] =>
    vectors.flatMap((v, i) => (outcome(v) === expected ? [] : [i]));
  const wrongAccept = wrong(contract.vectors.accept, "accept");
  const wrongReject = wrong(contract.vectors.reject, "reject");
  return wrongAccept.length === 0 && wrongReject.length === 0
    ? result.success(contract)
    : result.failure({
        category: "VALIDATION",
        code: "CONTRACT",
        message: `${contract.name}: the schema disagrees with its vectors`,
        context: { name: contract.name, wrongAccept, wrongReject },
      });
};
