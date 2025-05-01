import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { ShoppingCart, LocalShipping, Security, SupportAgent } from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        About DOMA
      </Typography>
      
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Revolutionizing Your Shopping Experience
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <Typography variant="body1" paragraph>
          DOMA is a next-generation ecommerce platform designed to provide seamless shopping experiences 
          for customers and powerful tools for merchants. Founded in 2023, we've quickly become a trusted 
          name in online retail by prioritizing quality, convenience, and innovation.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to bridge the gap between buyers and sellers with cutting-edge technology, 
          while maintaining the human touch that makes shopping enjoyable. Whether you're looking for 
          everyday essentials or unique finds, DOMA connects you with the best products from around the world.
        </Typography>
      </Box>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <ShoppingCart color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Easy Shopping</Typography>
            <Typography>Intuitive interface that makes finding and purchasing products effortless</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <LocalShipping color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Fast Delivery</Typography>
            <Typography>Reliable shipping with real-time tracking to your doorstep</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Security color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Secure Payments</Typography>
            <Typography>Industry-leading security to protect your transactions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SupportAgent color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>24/7 Support</Typography>
            <Typography>Dedicated customer service team ready to assist you</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ backgroundColor: 'background.paper', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Our Story
        </Typography>
        <Typography variant="body1" paragraph>
          DOMA began as a small startup with a big vision: to create an ecommerce ecosystem that benefits 
          both consumers and sellers equally. Our founders, experienced in both retail and technology, 
          recognized the need for a platform that combined the best aspects of online shopping while 
          eliminating common pain points.
        </Typography>
        <Typography variant="body1" paragraph>
          Today, DOMA serves millions of customers worldwide and partners with thousands of merchants, 
          from local artisans to global brands. We continue to innovate with features like augmented 
          reality product previews, AI-powered recommendations, and carbon-neutral shipping options.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;