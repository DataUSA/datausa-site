import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {fetchData} from "@datawheel/canon-core";
import {sum} from "d3-array";
import {format} from "d3-format";
const commas = format(",");
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";

const SubList = ({active, dimension, totals}) => <ul>
  { Object.keys(totals)
    .sort((a, b) => totals[a] - totals[b])
    .filter(key => totals[key] > 1)
    .map(key => <li className={active === key ? "active" : ""} key={key}>
      <span className="bp3-icon-standard bp3-icon-dot"></span>
      <Link className="title" to={`/about/classifications/${dimension}/${key}`}>{key}</Link>
      <span className="num">{commas(totals[key])}</span>
    </li>) }
</ul>;

class Classifications extends Component {

  render() {

    const {results, totals} = this.props.search;
    const {dimension, hierarchy} = this.props.router.params;

    const columns = ["id", "name"];

    const renderCell = (rowIndex, columnIndex) => {
      const key = columns[columnIndex];
      const d = results[rowIndex];
      const val = d[key];

      if (key === "name") {
        const link = `/profile/${d.profile}/${d.slug || d.id}`;
        return <Cell wrapText={true}>
          <Link to={link}>{ val }</Link>
        </Cell>;
      }
      return <Cell wrapText={true}>{ val }</Cell>;

    };

    return (
      <div id="Classifications">
        <div id="SideNav">
          <div className="content">
            <ul className="classifications">

              <li>
                <span className="title">Profile Type</span>
                <span className="num">Count</span>
              </li>

              <li className={ dimension === "Geography" ? "geo active" : "geo" }>
                <img src="/icons/dimensions/Geography - Black.svg" />
                <Link className="title" to="/about/classifications/Geography/State">Locations</Link>
                <span className="num">{commas(sum(Object.values(totals.Geography)))}</span>
              </li>
              { dimension === "Geography" && <SubList dimension={dimension} active={hierarchy} totals={totals.Geography} /> }

              <li className={ dimension === "PUMS Industry" ? "naics active" : "naics" }>
                <img src="/icons/dimensions/PUMS Industry - Black.svg" />
                <Link className="title" to="/about/classifications/PUMS Industry/Industry Sector">Industries</Link>
                <span className="num">{commas(sum(Object.values(totals["PUMS Industry"])))}</span>
              </li>
              { dimension === "PUMS Industry" && <SubList dimension={dimension} active={hierarchy} totals={totals["PUMS Industry"]} /> }

              <li className={ dimension === "PUMS Occupation" ? "soc active" : "soc" }>
                <img src="/icons/dimensions/PUMS Occupation - Black.svg" />
                <Link className="title" to="/about/classifications/PUMS Occupation/Major Occupation Group">Occupations</Link>
                <span className="num">{commas(sum(Object.values(totals["PUMS Occupation"])))}</span>
              </li>
              { dimension === "PUMS Occupation" && <SubList dimension={dimension} active={hierarchy} totals={totals["PUMS Occupation"]} /> }

              <li className={ dimension === "CIP" ? "cip active" : "cip" }>
                <img src="/icons/dimensions/CIP - Black.svg" />
                <Link className="title" to="/about/classifications/CIP/CIP2">Degrees</Link>
                <span className="num">{commas(sum(Object.values(totals.CIP)))}</span>
              </li>
              { dimension === "CIP" && <SubList dimension={dimension} active={hierarchy} totals={totals.CIP} /> }

              <li className={ dimension === "University" ? "university active" : "university" }>
                <img src="/icons/dimensions/University - Black.svg" />
                <Link className="title" to="/about/classifications/University/Carnegie Parent">Universities</Link>
                <span className="num">{commas(sum(Object.values(totals.University)))}</span>
              </li>
              { dimension === "University" && <SubList dimension={dimension} active={hierarchy} totals={totals.University} /> }

              <li className={ dimension === "NAPCS" ? "napcs active" : "napcs" }>
                <img src="/icons/dimensions/NAPCS - Black.svg" />
                <Link className="title" to="/about/classifications/NAPCS/NAPCS Section">Products &amp; Services</Link>
                <span className="num">{commas(sum(Object.values(totals.NAPCS)))}</span>
              </li>
              { dimension === "NAPCS" && <SubList dimension={dimension} active={hierarchy} totals={totals.NAPCS} /> }

            </ul>

          </div>
        </div>
        <div className="content table">
          <Table enableMultipleSelection={false}
            enableGhostCells={false}
            columnWidths={[150,  400]}
            enableColumnResizing={false}
            enableRowResizing={false}
            isRowHeaderShown={false}
            numRowsFrozen={1}
            numRows={ results.length }
            rowHeights={ results.map(() => 30) }
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } cellRenderer={ renderCell } />) }
          </Table>
        </div>
      </div>
    );

  }

}

Classifications.need = [
  fetchData("search", "/api/search?dimension=<dimension>&hierarchy=<hierarchy>&limit=50000", resp => {
    resp.results.sort((a, b) => a.name.localeCompare(b.name));
    return resp;
  })
];

export default connect(state => ({search: state.data.search}))(Classifications);
