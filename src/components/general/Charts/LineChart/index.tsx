import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';



interface IProps {
  data: any[];
  width?: number;
  height?: number;
  dataKey?: string;
  xKey?: string;
}

export default function LineChartComponent({
  data,
  width = 550,
  height = 300,
  dataKey = 'pv',
  xKey = 'name',
}: IProps) {
  return (
    <LineChart
      width={width}
      height={height}
      data={data}
      margin={{
        top: 5,
        right: 30,
        bottom: 5,
      }}
      className=' -ml-4  text-xs'
    >
      {/* <CartesianGrid strokeDasharray='0 0' /> */}
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type='monotone' dataKey={dataKey} stroke='#204D88' activeDot={{ r: 8 }} />
      {/* <Line type='monotone' dataKey='uv' stroke='#82ca9d' /> */}
    </LineChart>
  );
}
