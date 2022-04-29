import { Disclosure } from "@headlessui/react";
import { useGlobalPendingState, useDataRefresh } from "remix-utils";
import { CodeIcon, RefreshIcon } from "./icons";
import clsx from "clsx";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { JSONTree } from "react-json-tree";
import { useMatches } from "@remix-run/react";

type DevToolsProps = {
  defaultOpen?: boolean;
};

export function DevTools({ defaultOpen }: DevToolsProps) {
  let matches = useMatches();

  let state = useGlobalPendingState();

  let { refresh } = useDataRefresh();

  let lastMatch = [...matches].reverse()[0];

  let [activeMatchId, setActiveMatchId] = useState(lastMatch.id);

  let activeMatch = useMemo(
    function findActiveMatchById() {
      return matches.find((match) => match.id === activeMatchId) ?? lastMatch;
    },
    [matches, lastMatch, activeMatchId]
  );

  useEffect(
    function rollbackToFirstMatchWhenIdIsRemoved() {
      if (matches.every((match) => match.id !== activeMatchId)) {
        setActiveMatchId(lastMatch.id);
      }
    },
    [matches, activeMatchId, lastMatch.id]
  );

  return (
    <Disclosure defaultOpen={defaultOpen} as="div" className="remix-inspector">
      <Disclosure.Button className="disclosure-button">
        <CodeIcon aria-hidden className="icon-code" />
      </Disclosure.Button>

      <Disclosure.Panel className="diclosue-panel">
        <section>
          <div>
            <section className="routes-section">
              <Header>
                <h2>Routes</h2>
                <button
                  type="button"
                  className="refresh"
                  onClick={() => refresh()}
                >
                  Refresh
                </button>

                {state === "pending" ? (
                  <RefreshIcon aria-label="Pending" className="icon-refresh" />
                ) : null}
              </Header>
              <ul>
                {matches.map((match) => {
                  return (
                    <li key={match.id}>
                      <button
                        className={clsx("route-option", {
                          "route-option-active": match.id === activeMatchId,
                        })}
                        type="button"
                        onClick={() => setActiveMatchId(match.id)}
                      >
                        {match.id}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="route-details-section">
              <Header>
                <h2 style={{ lineHeight: 20 }}>Route Details</h2>
              </Header>
              <div style={{ paddingTop: 8, paddingBottom: 8 }}>
                <Table
                  data={[
                    { key: "Pathname", value: activeMatch.pathname },
                    { key: "Route ID", value: activeMatch.id },
                  ]}
                />
              </div>

              <Explorer data={activeMatch.data} heading="Data Explorer" />
              <Explorer data={activeMatch.params} heading="Params Explorer" />
              <Explorer data={activeMatch.handle} heading="Handle Explorer" />
            </section>
          </div>
        </section>
      </Disclosure.Panel>
    </Disclosure>
  );
}

function Header({ children }: { children: ReactNode }) {
  return <header className="header">{children}</header>;
}

function Explorer({ data, heading }: { data: unknown; heading: string }) {
  return (
    <>
      <Header>
        <h3>{heading}</h3>
      </Header>
      <div className="json-tree">
        <JSONTree
          data={data}
          invertTheme={false}
          theme={{
            scheme: "monokai",
            author: "wimer hazenberg (http://www.monokai.nl)",
            base00: "#0f172a",
            base01: "#383830",
            base02: "#49483e",
            base03: "#75715e",
            base04: "#a59f85",
            base05: "#f8f8f2",
            base06: "#f5f4f1",
            base07: "#f9f8f5",
            base08: "#f92672",
            base09: "#fd971f",
            base0A: "#f4bf75",
            base0B: "#a6e22e",
            base0C: "#a1efe4",
            base0D: "#66d9ef",
            base0E: "#ae81ff",
            base0F: "#cc6633",
          }}
        />
      </div>
    </>
  );
}

function Table({ data }: { data: Array<Record<"key" | "value", string>> }) {
  return (
    <table style={{ width: "100%" }}>
      <tbody>
        {data.map((row, index) => {
          return (
            <tr className="space-y-1" key={index}>
              <td
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                  width: "25%",
                }}
                className="text-slate-300"
              >
                {row.key}
              </td>
              <td>{row.value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
