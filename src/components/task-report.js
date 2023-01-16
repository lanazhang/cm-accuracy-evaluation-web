import React, { useState, useEffect } from 'react';
import {Container, ColumnLayout, Grid, Box, Link, Header, StatusIndicator,PieChart, Button, BarChart, AreaChart, ButtonDropdown} from '@cloudscape-design/components';

const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

function TaskReport ({selectedTask, onBack}) {
    const [task, setTask] = useState(selectedTask);
    const [report, setReport] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(null); // null, LOADING, LOADED

    const [topCategoryFilter, setTopCategoryFilter] = useState(null);
    const [subCategoryFilter, setSubCategoryFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);
    const [confidenceThreshold, setConfidenceThreshold] = useState(null);

    const TypeFilterValue = [
           { id: "-", text: "-- All --" },
           { id: "true-positive", text: "True Positive" },
           { id: "false-positive", text: "False Positive" },
         ]
    const ConfidenceValue = [
           { id: "50", text: "50%" },
           { id: "60", text: "60%" },
           { id: "70", text: "70%" },
           { id: "80", text: "80%" },
           { id: "90", text: "90%" },
         ]

    useEffect(() => {
      // Auto refresh 
      if (loadingStatus === null && task !== null) {
        reloadReport();
      }
    })
  
    function reloadReport() {
      setLoadingStatus("LOADING");
      fetch(ACCURACY_EVAL_SERVICE_URL + 'report/report', {
        method: 'POST',
        body: JSON.stringify({
          id: task.id,
          top_category: topCategoryFilter,
          sub_category: subCategoryFilter,
          type: typeFilter,
          confidence_threshold: confidenceThreshold,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var j = JSON.parse(data.body)
            setReport(j);
            setLoadingStatus("LOADED");
        })
        .catch((err) => {
          console.log(err.message);
          setLoadingStatus("LOADED");
        });
    }

    const handleCategoryItemClick = e => {
      console.log(e);
    }

    const handleTypeItemClick = e => {
      if (e.detail.id == typeFilter)
        return;

      if (e.detail.id === '-')
        setTypeFilter(null);
      else
        setTypeFilter(e.detail.id);
      setLoadingStatus(null);
    }

    const handleConfidenceItemClick = e => {
      if (parseInt(e.detail.id) == confidenceThreshold)
        return;
      setConfidenceThreshold(parseInt(e.detail.id));
      setLoadingStatus(null);
    } 

    const Filter = () => (
      <ColumnLayout columns="4" variant="text-grid">
      <ButtonDropdown
         onItemClick={handleCategoryItemClick}
         
         items={[
           { id: "Explicit Nudity", text: "Explicit Nudity" },
           { id: "Suggestive", text: "Suggestive" },
           {
             id: "Female Swimwear Or Underwear",
             text: "Female Swimwear Or Underwear",
             items: [
               { id: "start", text: "Start" },
               { id: "stop", text: "Stop", disabled: true },
               {
                 id: "hibernate",
                 text: "Hibernate",
                 disabled: true
               },
               {
                 id: "reboot",
                 text: "Reboot",
                 disabled: true
               },
               { id: "terminate", text: "Terminate" }
             ]
           }
         ]}
         expandableGroups
       >
        Filter by moderation category
       </ButtonDropdown>       
       <ButtonDropdown
         onItemClick={handleTypeItemClick}
         items={TypeFilterValue}
         expandableGroups
       >
         {typeFilter === null? "Filter by review result": TypeFilterValue.find(t => t.id == typeFilter)[0].text}
       </ButtonDropdown>    
       <ButtonDropdown
         onItemClick={handleConfidenceItemClick}
         items={ConfidenceValue}
         expandableGroups
       >
        {confidenceThreshold === null? "Select confidence threshold": ConfidenceValue.find(c => c.id == confidenceThreshold)[0].text}
       </ButtonDropdown>    
       </ColumnLayout>
    )
    
    const Metrics = () => (
      <Container
        header={
          <Header 
            variant="h2" 
            description={task.name + " - " + task.description}>
            Moderation accuracy overview
            &nbsp;&nbsp;<StatusIndicator type={task.status === 'COMPLETED' ? 'success' : task.status === 'FAILED'? 'error': 'info' }>{task.status}</StatusIndicator>
          </Header>
        }
        >

        <ColumnLayout columns="4" variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Total number of images</Box>
            <Link variant="awsui-value-large">{parseInt(task.total_files).toLocaleString("en-US")}</Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Images labled by Rekognition</Box>
            <Link variant="awsui-value-large">{report !== null?report.labeled.toLocaleString("en-US"):0}</Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Human reviewed images</Box>
            <Link variant="awsui-value-large">{report !== null?report.reviewed.toLocaleString("en-US"):0}</Link>
          </div>
          <div>
            <Box variant="awsui-key-label">False positive / True positive</Box>
            <Link variant="awsui-value-large">{report !== null?report.fp.toLocaleString("en-US"):0} / {report !== null?report.tp.toLocaleString("en-US"):0}</Link>
          </div>
        </ColumnLayout>
      </Container>
    )

    const TypePie = () => (
      <Container
        header={
          <Header 
            variant="h2" 
            description="False Positive vs. True Positive">
            Human review result
          </Header>
        }
        >
        {report !== null && report.by_type !== null?
        <PieChart
              hideFilter="true"
              variant="donut"
              hideLegend="true"
              size='medium'
              data={report.by_type}
              detailPopoverContent={(datum, sum) => [
                { key: "Number of images", value: datum.value },
                {
                  key: "Percentage",
                  value: `${((datum.value / sum) * 100).toFixed(
                    0
                  )}%`
                }
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} images, ${(
                  (datum.value / sum) *
                  100
                ).toFixed(0)}%`
              }
              i18nStrings={{
                detailsValue: "Value",
                detailsPercentage: "Percentage",
                filterLabel: "Filter displayed data",
                filterPlaceholder: "Filter data",
                filterSelectedAriaLabel: "selected",
                detailPopoverDismissAriaLabel: "Dismiss",
                legendAriaLabel: "Legend",
                chartAriaRoleDescription: "pie chart",
                segmentAriaRoleDescription: "segment"
              }}
              ariaDescription="Pie chart showing number of images by Rekognition moderation top category."
              ariaLabel="Pie chart"
              errorText="Error loading data."
              loadingText="Loading chart"
              recoveryText="Retry"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                  <Box variant="p" color="inherit">
                    There is no data available
                  </Box>
                </Box>
              }
            />: <div/>}
      </Container>
    )

    const ByTopCategoryPie = () => (
      <Container
        header={
          <Header 
            variant="h2" 
            description="Number of images by moderation top level category">
            Distribution by moderation top level category
          </Header>
        }
        >
        {report !== null && report.by_top_category !== null?
        <PieChart
              hideFilter="true"
              variant="donut"
              hideLegend="true"
              size='medium'
              data={report.by_top_category}
              detailPopoverContent={(datum, sum) => [
                { key: "Number of images", value: datum.value },
                {
                  key: "Percentage",
                  value: `${((datum.value / sum) * 100).toFixed(
                    0
                  )}%`
                }
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} images, ${(
                  (datum.value / sum) *
                  100
                ).toFixed(0)}%`
              }
              i18nStrings={{
                detailsValue: "Value",
                detailsPercentage: "Percentage",
                filterLabel: "Filter displayed data",
                filterPlaceholder: "Filter data",
                filterSelectedAriaLabel: "selected",
                detailPopoverDismissAriaLabel: "Dismiss",
                legendAriaLabel: "Legend",
                chartAriaRoleDescription: "pie chart",
                segmentAriaRoleDescription: "segment"
              }}
              ariaDescription="Pie chart showing number of images by Rekognition moderation top category."
              ariaLabel="Pie chart"
              errorText="Error loading data."
              loadingText="Loading chart"
              recoveryText="Retry"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                  <Box variant="p" color="inherit">
                    There is no data available
                  </Box>
                </Box>
              }
            />: <div/>}
      </Container>
    )

    const BySubCategoryByType = () => (
      <Container
      header={
        <Header 
          variant="h2" 
          description="Number of images by moderation secondary level category">
          Distribution by moderation secondary level category
        </Header>
      }
      >
        {report !== null && report.by_sub_category_type !== null?
        <BarChart
              stackedBars
              detailPopoverSize="large"
              series={[
                
                {
                  title: "True Positive",
                  type: "bar",
                  data: report.by_sub_category_type["true-positive"].map((x, result) => {
                    return {
                        "x": x.title,
                        "y": x.value
                    };
                  }),
                  valueFormatter: e => e.toLocaleString("en-US")
                },
                {
                  title: "False Positive",
                  type: "bar",
                  data: report.by_sub_category_type["false-positive"].map((x, result) => {
                    return {
                        "x": x.title,
                        "y": x.value
                    };
                  }),
                  valueFormatter: e => e.toLocaleString("en-US")
                }
              ]}
              xDomain={report.by_sub_category.map(i=>i.title)} 
              yDomain={[0, Math.max(...report.by_sub_category_type["true-positive"].map(x => x.value).concat(report.by_sub_category_type["false-positive"].map(x => x.value)))]}
              i18nStrings={{
                filterLabel: "Filter displayed data",
                filterPlaceholder: "Filter data",
                filterSelectedAriaLabel: "selected",
                detailPopoverDismissAriaLabel: "Dismiss",
                legendAriaLabel: "Legend",
                chartAriaRoleDescription: "line chart",
                xTickFormatter: e =>
                  e.toLocaleString("en-US"),
              }}
              ariaLabel="Single data series line chart"
              errorText="Error loading data."
              height={300}
              hideFilter
              loadingText="Loading chart"
              recoveryText="Retry"
              xScaleType="categorical"
              xTitle="Sub category"
              yTitle="Number of images"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                  <Box variant="p" color="inherit">
                    There is no data available
                  </Box>
                </Box>
              }
              noMatch={
                <Box textAlign="center" color="inherit">
                  <b>No matching data</b>
                  <Box variant="p" color="inherit">
                    There is no matching data to display
                  </Box>
                  <Button>Clear filter</Button>
                </Box>
              }
            />:<div />}
      </Container>
    )

    const ByTopCategoryByType = () => (
      <Container
      header={
        <Header 
          variant="h2" 
          description="Number of images by moderation top level category">
          Distribution by moderation top level category
        </Header>
      }
      >
        {report !== null && report.by_sub_category_type !== null?
        <BarChart
              stackedBars
              detailPopoverSize="large"
              series={[
                
                {
                  title: "True Positive",
                  type: "bar",
                  data: report.by_top_category_type["true-positive"].map((x, result) => {
                    return {
                        "x": x.title,
                        "y": x.value
                    };
                  }),
                  valueFormatter: e => e.toLocaleString("en-US")
                },
                {
                  title: "False Positive",
                  type: "bar",
                  data: report.by_top_category_type["false-positive"].map((x, result) => {
                    return {
                        "x": x.title,
                        "y": x.value
                    };
                  }),
                  valueFormatter: e => e.toLocaleString("en-US")
                }
              ]}
              xDomain={report.by_top_category.map(i=>i.title)} 
              yDomain={[0, Math.max(...report.by_top_category_type["true-positive"].map(x => x.value).concat(report.by_top_category_type["false-positive"].map(x => x.value)))]}
              i18nStrings={{
                filterLabel: "Filter displayed data",
                filterPlaceholder: "Filter data",
                filterSelectedAriaLabel: "selected",
                detailPopoverDismissAriaLabel: "Dismiss",
                legendAriaLabel: "Legend",
                chartAriaRoleDescription: "line chart",
                xTickFormatter: e =>
                  e.toLocaleString("en-US"),
              }}
              ariaLabel="Single data series line chart"
              errorText="Error loading data."
              height={300}
              hideFilter
              loadingText="Loading chart"
              recoveryText="Retry"
              xScaleType="categorical"
              xTitle="Sub category"
              yTitle="Number of images"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                  <Box variant="p" color="inherit">
                    There is no data available
                  </Box>
                </Box>
              }
              noMatch={
                <Box textAlign="center" color="inherit">
                  <b>No matching data</b>
                  <Box variant="p" color="inherit">
                    There is no matching data to display
                  </Box>
                  <Button>Clear filter</Button>
                </Box>
              }
            />:<div />}
      </Container>
    )

    return (
      <div>
          <Filter />
          <br />
          <Metrics />
          <br/>
          <ColumnLayout columns={2}>
            <ByTopCategoryPie />
            <TypePie />
          </ColumnLayout>
          <br/>
          <ByTopCategoryByType />
          <br/>
          <BySubCategoryByType />
      </div>
    );
}

export {TaskReport};