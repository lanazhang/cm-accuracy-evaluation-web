import React, { useState, useEffect } from 'react';
import {Container, ColumnLayout, Grid, Box, Link, Header, StatusIndicator,PieChart, Button, BarChart, AreaChart, ButtonDropdown, Spinner} from '@cloudscape-design/components';
import {ModerationCategories, TypeFilterValue, ConfidenceValue} from '../resources/data-provider';

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
    const [subCategories, setSubCategories] = useState(null);

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

    const handleTopCategoryItemClick = e => {
      if (e.detail.id == topCategoryFilter) 
        return;
      if (e.detail.id == '-- All --')
        setTopCategoryFilter(null);
      else  
        setTopCategoryFilter(e.detail.id);
      
      // Set sub category filter
      var sub = ModerationCategories[e.detail.id].map((x) => {
        return {
            "id": x,
            "text": x
        };
      })
      setSubCategories(sub);
      setLoadingStatus(null);
    }

    const handleSubCategoryItemClick = e => {
      console.log(e);
      if (e.detail.id == topCategoryFilter) 
        return;
      if (e.detail.id == '-- All --')
        setSubCategoryFilter(null);
      else  
        setSubCategoryFilter(e.detail.id);
      setLoadingStatus(null);
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

    const handleReset = e => {
      setTopCategoryFilter(null);
      setSubCategoryFilter(null);
      setConfidenceThreshold(null);
      setTypeFilter(null);
      setLoadingStatus(null);
    }
  
    const Filter = () => (
      <div>
      <ColumnLayout columns="1" variant="text-grid">
        <Box float='right'>
              {loadingStatus === "LOADING"?<Spinner />
              :<div /> } 
         &nbsp;<Button variant="normal" onClick={handleReset} disabled={topCategoryFilter === null && subCategoryFilter === null && typeFilter === null && confidenceThreshold === null} >Reset</Button>    
         &nbsp;<Button variant="primary" onClick={onBack}>Back to list</Button>
        </Box>
      </ColumnLayout>
      <ColumnLayout columns="1" variant="text-grid">
      <Container float='left'>
        <ButtonDropdown
          onItemClick={handleTopCategoryItemClick}
          items={Object.keys(ModerationCategories).map((x) => {
                      return {
                          "id": x,
                          "text": x
                      };
                    })}
          expandableGroups
        >
          {topCategoryFilter === null? "Filter top level category": topCategoryFilter}
        </ButtonDropdown>       
        &nbsp;  
        <ButtonDropdown
          onItemClick={handleSubCategoryItemClick}
          items={subCategories !== null? subCategories: []}
          expandableGroups
        >
          {subCategoryFilter === null? "Filter secondary level category": subCategoryFilter}
        </ButtonDropdown> 
        &nbsp;        
        <ButtonDropdown
          onItemClick={handleTypeItemClick}
          items={TypeFilterValue}
          expandableGroups
        >
          {typeFilter === null? "Filter by review result": TypeFilterValue.find(t => t.id == typeFilter).text}
        </ButtonDropdown>  
        &nbsp;    
        <ButtonDropdown
          onItemClick={handleConfidenceItemClick}
          items={ConfidenceValue}
          expandableGroups
        >
          {confidenceThreshold === null? "Select confidence threshold": ConfidenceValue.find(c => c.id == confidenceThreshold).text}
        </ButtonDropdown>    
        </Container>
       </ColumnLayout>
       </div>
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

        <ColumnLayout columns="3" variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Total number of images</Box>
            <Box variant="awsui-value-large">{parseInt(task.total_files).toLocaleString("en-US")}</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Images labeled by Rekognition as inappropriate</Box>
            <Box variant="awsui-value-large">{report !== null?report.labeled.toLocaleString("en-US"):0}</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Rekognition label ratio</Box>
            <Box variant="awsui-value-large">{report !== null?(report.labeled*100/parseInt(task.total_files)).toFixed(2)+"%":0}</Box>
          </div>
        </ColumnLayout>
        <ColumnLayout columns="3" variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Human reviewed images</Box>
            <Box variant="awsui-value-large">{report !== null?report.reviewed.toLocaleString("en-US"):0}</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">False positive images</Box>
            <Box variant="awsui-value-large">{report !== null?report.fp.toLocaleString("en-US"):0}</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">True positive images</Box>
            <Box variant="awsui-value-large">{report !== null?report.tp.toLocaleString("en-US"):0}</Box>
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

    const BySubCategoryByTypeBar = () => (
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
              xTitle="Moderation category"
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

    const ByTopCategoryByTypeBar = () => (
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
              xTitle="Moderation category"
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

    const ByConfidenceByTypeBar = () => (
      <Container
      header={
        <Header 
          variant="h2" 
          description="Number of images in each confidence score bucket">
          Confidence score distribution
        </Header>
      }
      >
        {report !== null && report.by_confidence_type !== null?
        <BarChart
              stackedBars
              detailPopoverSize="large"
              series={[
                
                {
                  title: "True Positive",
                  type: "bar",
                  data: report.by_confidence_type["true-positive"].map((x, result) => {
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
                  data: report.by_confidence_type["false-positive"].map((x, result) => {
                    return {
                        "x": x.title,
                        "y": x.value
                    };
                  }),
                  valueFormatter: e => e.toLocaleString("en-US")
                }
              ]}
              xDomain={["50", "55", "60", "65", "70", "75", "80", "85", "90", "95"]} 
              yDomain={[0, Math.max(...report.by_confidence_type["true-positive"].map(x => x.value).concat(report.by_confidence_type["false-positive"].map(x => x.value)))]}
              i18nStrings={{
                filterLabel: "Filter displayed data",
                filterPlaceholder: "Filter data",
                filterSelectedAriaLabel: "selected",
                detailPopoverDismissAriaLabel: "Dismiss",
                legendAriaLabel: "Legend",
                chartAriaRoleDescription: "line chart",
                xTickFormatter: e =>
                  e + '%',
              }}
              ariaLabel="Single data series line chart"
              errorText="Error loading data."
              height={300}
              hideFilter
              loadingText="Loading chart"
              recoveryText="Retry"
              xScaleType="categorical"
              xTitle="Confidence score range"
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
          <ByTopCategoryByTypeBar />
          <br/>
          <BySubCategoryByTypeBar />
          <br />
          <ByConfidenceByTypeBar />
      </div>
    );
}

export {TaskReport};