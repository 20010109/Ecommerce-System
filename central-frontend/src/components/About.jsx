import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { ShoppingCart, LocalShipping, Security, SupportAgent } from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
      >
        About DOMA
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        align="center"
        sx={{ mb: 5, color: 'text.secondary', fontStyle: 'italic' }}
      >
        Revolutionizing Your Shopping Experience
      </Typography>

      <Box sx={{ mb: 6, px: { xs: 2, md: 8 }, textAlign: 'center' }}>
        <Typography variant="body1" paragraph sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.8 }}>
          DOMA is a next-generation ecommerce platform designed to provide seamless shopping experiences
          for customers and powerful tools for merchants. Founded in 2023, we've quickly become a trusted
          name in online retail by prioritizing quality, convenience, and innovation.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          Our mission is to bridge the gap between buyers and sellers with cutting-edge technology,
          while maintaining the human touch that makes shopping enjoyable. Whether you're looking for
          everyday essentials or unique finds, DOMA connects you with the best products from around the world.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8, alignItems: 'stretch' }}>
        {[
          {
            icon: <ShoppingCart color="primary" sx={{ fontSize: 50, mb: 2 }} />,
            title: 'Easy Shopping',
            text: 'Intuitive interface that makes finding and purchasing products effortless',
          },
          {
            icon: <LocalShipping color="primary" sx={{ fontSize: 50, mb: 2 }} />,
            title: 'Fast Delivery',
            text: 'Reliable shipping with real-time tracking to your doorstep',
          },
          {
            icon: <Security color="primary" sx={{ fontSize: 50, mb: 2 }} />,
            title: 'Secure Payments',
            text: 'Industry-leading security to protect your transactions',
          },
          {
            icon: <SupportAgent color="primary" sx={{ fontSize: 50, mb: 2 }} />,
            title: '24/7 Support',
            text: 'Dedicated customer service team ready to assist you',
          },
        ].map((feature, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              {feature.icon}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                {feature.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                {feature.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          backgroundColor: 'grey.100',
          p: { xs: 3, md: 6 },
          borderRadius: 3,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}
        >
          Our Story
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          DOMA began as a small startup with a big vision: to create an ecommerce ecosystem that benefits
          both consumers and sellers equally. Our founders, experienced in both retail and technology,
          recognized the need for a platform that combined the best aspects of online shopping while
          eliminating common pain points.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          Today, DOMA serves millions of customers worldwide and partners with thousands of merchants,
          from local artisans to global brands. We continue to innovate with features like augmented
          reality product previews, AI-powered recommendations, and carbon-neutral shipping options.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
