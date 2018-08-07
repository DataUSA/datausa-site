import React, {Component} from "react";
import {Tooltip} from "@blueprintjs/core";
import "./SourceGroup.css";

export default class SourceGroup extends Component {

  render() {
    const {sources} = this.props;
    if (!sources.length) return null;

    console.log(sources);
    return <div className="SourceGroup">
      Data provided by
      { sources.map((source, i) => {

        const {
          dataset_description: datasetDesc,
          dataset_link: datasetLink,
          dataset_name: dataset,
          source_description: orgDesc,
          source_link: orgLink,
          source_name: org,
          table_id: table
        } = source.annotations;

        const orgName = org && `the ${org.replace(/^(T|t)he\s/g, "")}`;
        const datasetName = dataset && `${dataset}`;

        return <span key={i} className="source">
          { i && i === sources.length - 1 ? <span>and </span> : null }
          { org && <Tooltip content={orgDesc} isDisabled={!orgDesc}>
            { orgLink ? <a className="title" href={orgLink} target="_blank" rel="noopener noreferrer">{ orgName }</a> : <span className="title">{orgName}</span> }
          </Tooltip> }
          { dataset && <Tooltip content={datasetDesc} isDisabled={!datasetDesc}>
            { datasetLink ? <a className="title" href={datasetLink} target="_blank" rel="noopener noreferrer">{ datasetName }</a> : <span className="title">{datasetName}</span> }
          </Tooltip> }
          { table && <span> ({table})</span> }
          { i < sources.length - 1 && <span>,</span> }
        </span>;
      })}
    </div>;
  }

}
