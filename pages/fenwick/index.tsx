import { css } from "@emotion/react";
import Head from "next/head";
import { useState } from "react";

interface CellContentProps {
  value: number;
  onChange: (value: number) => void;
}
const CellContent: React.FC<CellContentProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        css={cellInput}
        type="number"
        size={1}
        value={value}
        onChange={(e) => {
          const value = Number.parseInt(e.target.value);
          if (Number.isInteger(value)) {
            onChange(value);
          }
        }}
        onBlur={() => setEditing(false)}
      />
    );
  } else {
    return (
      <p
        onClick={() => {
          setEditing(true);
        }}
      >
        {value}
      </p>
    );
  }
};

interface State {
  array: number[];
  data: number[];
  sumTraversed: Set<number>;
  setTraversed: Set<number>;
  sum: number;
}

const FenwickTree = () => {
  const { state, updateLength, setValue, sumValue } = useFenwickTree();
  return (
    <>
      <Head>
        <title>Fenwick Tree</title>
      </Head>
      <div>
        <table>
          <tbody>
            <tr>
              {state.data.map((value, index) => {
                const color = state.sumTraversed.has(index)
                  ? "orange"
                  : state.setTraversed.has(index)
                  ? "cyan"
                  : undefined;
                return (
                  <td key={index} css={tableCell(color)}>
                    <div css={tableCellContent}>{value}</div>
                  </td>
                );
              })}
            </tr>
            <tr>
              {state.array.map((value, index) => (
                <td key={index} css={tableCell()}>
                  <div css={tableCellContent}>
                    <CellContent
                      value={value}
                      onChange={(v) => {
                        setValue(index, v);
                      }}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {state.array.map((_, index) => (
                <td key={index} css={tableCell()}>
                  <div css={tableCellContent}>
                    <button
                      onClick={() => {
                        sumValue(index + 1);
                      }}
                    >
                      {index}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div css={initializeInput}>
          <p>N=</p>
          <input
            type="number"
            value={state.array.length}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value);
              if (Number.isInteger(value) && value > 0) {
                updateLength(value);
              }
            }}
          />
        </div>
        <div css={initializeInput}>
          <p>sum={state.sum}</p>
        </div>
      </div>
    </>
  );
};

const fenwickAddInplace = (data: number[], index: number, value: number) => {
  let cur = index;
  const traversed = new Set<number>();
  while (cur < data.length) {
    data[cur] += value;
    traversed.add(cur);
    cur |= cur + 1;
  }
  return traversed;
};
const fenwickSum = (data: number[], length: number) => {
  let sum = 0;
  let cur = length - 1;
  const traversed = new Set<number>();
  while (cur >= 0) {
    sum += data[cur];
    traversed.add(cur);
    cur = (cur & (cur + 1)) - 1;
  }
  return { sum, traversed };
};

const fenwickRecompute = (array: number[]) => {
  const data = [...array];
  data.fill(0);
  array.forEach((value, index) => {
    fenwickAddInplace(data, index, value);
  });
  return data;
};

const useFenwickTree = () => {
  const [state, setState] = useState<State>({
    array: [0],
    data: [0],
    sumTraversed: new Set(),
    setTraversed: new Set(),
    sum: 0,
  });

  const updateLength = (newLength: number) => {
    if (newLength > state.array.length) {
      let newArray = [...state.array];
      while (newArray.length < newLength) {
        newArray.push(0);
      }
      setState({
        array: newArray,
        data: fenwickRecompute(newArray),
        sumTraversed: new Set(),
        setTraversed: new Set(),
        sum: 0,
      });
    } else {
      let newArray = state.array.slice(0, newLength);
      setState({
        array: newArray,
        data: fenwickRecompute(newArray),
        sumTraversed: new Set(),
        setTraversed: new Set(),
        sum: 0,
      });
    }
  };

  const setValue = (index: number, value: number) => {
    const newArray = [...state.array];
    const add = value - newArray[index];
    newArray[index] = value;
    const newData = [...state.data];
    const setTraversed = fenwickAddInplace(newData, index, add);
    setState({
      array: newArray,
      data: newData,
      sumTraversed: new Set(),
      setTraversed,
      sum: 0,
    });
  };

  const sumValue = (length: number) => {
    const { sum, traversed: sumTraversed } = fenwickSum(state.data, length);
    setState({
      ...state,
      setTraversed: new Set(),
      sumTraversed,
      sum,
    });
  };

  return { state, updateLength, setValue, sumValue };
};

const initializeInput = css`
  display: flex;
  flex-direction: row;
`;

const tableCellContent = css`
  padding: 10px;
  width: 80px;
`;

const tableCell = (color?: string) => css`
  border: 1px solid;
  background-color: ${color};
`;

const cellInput = css`
  width: 100%;
`;

export default FenwickTree;
