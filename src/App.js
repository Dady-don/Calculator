import { useEffect, useReducer, useState } from "react";
import "./App.css";
import DigitButton from "./DigitButton";
import Operations from "./Operations";

export const ACTIONS = {
  //specifying the different possible actions
  ADD_DIGIT: "add-digit",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  CHOOSE_OPERATION: "choose-operation",
  EVALUATE: "evaluate",
};

function reducer(state, { type, payload }) {
  //state management
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overWrite) {
        // if we have already performed the evaluation and type any other digit, the currentOperand is replaced by the new digit entered.
        return {
          ...state,
          currentOperand: payload.digit,
          overWrite: false,
        };
      }
      if (payload.digit === "0" && state.currentOperand === "0") return state; //if the operand is 0 already, and current operand is also 0, do not add any more zeros.

      if (payload.digit === "." && state.currentOperand.includes("."))
        return state; //doesn't allow adding more than one dot.
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`, //adding the clicked digit to our current operand.
      };
    case ACTIONS.CLEAR:
      return {}; //return an empty state.

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null)
        return state; //returns the current state if there is no operand before the operation.

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation, // in case we by mistake enter the wrong operation and want to change it.
        };
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null, //setting current operand as the previous operand and making the current operand as null so that we can enter a new operand.
        };
      }
      //default case:
      return {
        ...state,
        previousOperand: evaluate(state), //takes the current and previous operand, solves them and stores them as the previous operand.
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      )
        return state;
      // if any of the operands is not available, do nothing

      return {
        ...state,
        overWrite: true, // to overwrite the currentOperand if we have performed the evaluation and type anything else.
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };

    case ACTIONS.DELETE_DIGIT:
      if (state.overWrite) {
        return {
          ...state,
          currentOperand: null,
          overWrite: false,
        };
      }

      if (state.currentOperand == null) return state;

      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null,
        };
      }
      //default behaviour:
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1), //remove the last digit from the operand
      };
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand); //The parseFloat() parses the value as a string and returns the first number. If the first character cannot be converted NaN is returned.
  const current = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(current)) return "";

  let computation = "";
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "÷":
      computation = prev / current;
      break;
  }

  return computation.toString();
}

//to format the number in en-us style, add commas.
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0, // not changing the decimal part.
});

function formatOperand(operand) {
  if (operand == null) return;

  const [integer, decimal] = operand.split(".");

  if (decimal == null) return INTEGER_FORMATTER.format(integer);

  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  ); //useReducer takes the current state and dispatch function. current state is destructured into three variables.

  return (
    <div className="calculator-grid">
      <div className="output">
        {" "}
        {/**output section*/}
        <div className="previous_operand">
          {formatOperand(previousOperand)} {operation}
        </div>{" "}
        {/**contains the first operand and the sign*/}
        <div className="current_operand">
          {formatOperand(currentOperand)}
        </div>{" "}
        {/**contains the second operand*/}
      </div>

      <button
        className="span_two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>

      <Operations operation="÷" dispatch={dispatch} />

      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <Operations operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <Operations operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <Operations operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span_two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>
        =
      </button>

      {/* <span onClick={()=> setCount(count+1)}>+</span>
    <p>{count}</p>
      <p>{width}</p> */}
    </div>
  );
}

export default App;
