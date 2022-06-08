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
  const cells = createCells(state.array.length);
  return (
    <>
      <Head>
        <title>Fenwick Tree</title>
      </Head>
      <div>
        <table>
          <tbody>
            {cells.map((row, group) => {
              return (
                <tr key={group}>
                  {row.map((cell, index) => {
                    if (cell) {
                      const { value, range } = cell;
                      const color = state.sumTraversed.has(value)
                        ? "orange"
                        : state.setTraversed.has(value)
                        ? "cyan"
                        : undefined;
                      return (
                        <td colSpan={range} key={index} css={tableCell(color)}>
                          <div css={innerCellContainer}>
                            <div css={tableCellContent}>
                              {state.data[value]}
                            </div>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td key={index} css={tableCell(undefined, true)}>
                          <div css={innerCellContainer}>
                            <div css={tableCellContent}></div>
                          </div>
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
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

const createCells = (length: number) => {
  const groups: Set<number>[] = [];
  for (let index = 0; index < length; index++) {
    let group = 0;
    let cur = index + 1;
    while (cur % 2 === 0 && cur > 0) {
      cur /= 2;
      group += 1;
    }
    while (groups.length <= group) {
      groups.push(new Set());
    }
    groups[group].add(index);
  }

  const rows: ({ value: number; range: number } | undefined)[][] = [];
  groups.forEach((indices, group) => {
    const range = 1 << group;
    const row: ({ value: number; range: number } | undefined)[] = [];
    for (let value = 0; value < length; value++) {
      if (indices.has(value)) {
        for (let j = 0; j < range - 1; j++) {
          row.pop();
        }
        row.push({ value, range });
      } else {
        row.push(undefined);
      }
    }
    rows.push(row);
  });
  return rows;
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

const innerCellContainer = css`
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
`;

const tableCell = (color?: string, noBorder?: boolean) => css`
  border: ${noBorder ? "0" : "1px"} solid;
  background-color: ${color};
  text-align: right;
`;

const cellInput = css`
  width: 100%;
`;

export default FenwickTree;
