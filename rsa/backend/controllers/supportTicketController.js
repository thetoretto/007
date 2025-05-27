const SupportTicket = require('../models/SupportTicket'); // Assuming SupportTicket model exists or will be created
const User = require('../models/User');
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
// const { sendEmail } = require('../utils/email'); // For notifying about ticket updates

const logger = createLogger('SupportTicketController');

/**
 * @desc    User creates a new support ticket
 * @route   POST /api/v1/support-tickets
 * @access  Private (User)
 */
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, category, priority, attachments } = req.body;
    const userId = req.user.id;

    if (!subject || !description || !category) {
      return next(new ValidationError('Subject, description, and category are required for a support ticket.', 400));
    }

    const ticketData = {
      user: userId,
      subject,
      description,
      category, // e.g., 'technical_issue', 'billing', 'general_inquiry'
      priority: priority || 'medium', // e.g., 'low', 'medium', 'high', 'urgent'
      status: 'open', // Initial status
      messages: [
        {
          sender: userId,
          message: description,
          timestamp: Date.now(),
          messageType: 'user_message'
        }
      ],
      attachments: attachments || [], // Array of attachment URLs or identifiers
      metadata: { createdAt: Date.now(), createdBy: userId, lastUpdatedAt: Date.now(), updatedBy: userId }
    };

    const ticket = await SupportTicket.create(ticketData);

    // TODO: Notify admin/support team about new ticket
    // const adminUsers = await User.find({ role: { $in: ['admin', 'support_agent'] } }).select('email');
    // for (const admin of adminUsers) {
    //    await sendEmail({ to: admin.email, subject: `New Support Ticket: ${ticket.subject}`, text: `...` });
    // }

    logger.info('Support ticket created successfully', { ticketId: ticket._id, userId, subject });
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully. We will get back to you shortly.',
      data: ticket
    });
  } catch (error) {
    logger.error('Error creating support ticket', { userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while creating your support ticket.', 500));
  }
};

/**
 * @desc    Get all support tickets for the logged-in user
 * @route   GET /api/v1/support-tickets/my-tickets
 * @access  Private (User)
 */
exports.getMyTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const features = new APIFeatures(SupportTicket.find({ user: userId })
        .populate('assignedTo', 'profile.firstName profile.lastName')
        .sort('-metadata.lastUpdatedAt'), // Sort by last update
        req.query)
      .filter()
      .paginate();

    const tickets = await features.query;
    const totalTickets = await SupportTicket.countDocuments({ ...features.getQuery()._conditions, user: userId });

    logger.info('Retrieved user support tickets', { userId, count: tickets.length });
    res.status(200).json({
      success: true,
      count: tickets.length,
      total: totalTickets,
      pagination: features.pagination,
      data: tickets
    });
  } catch (error) {
    logger.error('Error getting user support tickets', { userId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving your support tickets.', 500));
  }
};

/**
 * @desc    Get a single support ticket by ID (user can only access their own)
 * @route   GET /api/v1/support-tickets/:id
 * @access  Private (User/Admin)
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let ticketQuery = SupportTicket.findById(ticketId)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('assignedTo', 'profile.firstName profile.lastName')
        .populate('messages.sender', 'profile.firstName profile.lastName role');

    const ticket = await ticketQuery;

    if (!ticket) {
      return next(new NotFoundError(`Support ticket not found with ID: ${ticketId}`, 404));
    }

    // User can only access their own tickets, admin can access any
    if (userRole !== 'admin' && userRole !== 'support_agent' && ticket.user._id.toString() !== userId) {
      return next(new AuthorizationError('You are not authorized to view this support ticket.', 403));
    }

    logger.info('Retrieved support ticket by ID', { ticketId, userId, userRole });
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error getting support ticket by ID', { ticketId: req.params.id, userId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Support ticket not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving the support ticket.', 500));
  }
};

/**
 * @desc    User or Admin adds a message to a support ticket
 * @route   POST /api/v1/support-tickets/:id/messages
 * @access  Private (User/Admin)
 */
exports.addMessageToTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const { message, attachments } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!message) {
      return next(new ValidationError('Message content is required.', 400));
    }

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return next(new NotFoundError(`Support ticket not found with ID: ${ticketId}`, 404));
    }

    // User can only add messages to their own tickets, admin/support can add to any assigned/open ticket
    if (senderRole !== 'admin' && senderRole !== 'support_agent' && ticket.user.toString() !== senderId) {
      return next(new AuthorizationError('You are not authorized to add messages to this ticket.', 403));
    }
    // If support agent, check if assigned or if ticket is unassigned
    if (senderRole === 'support_agent' && ticket.assignedTo && ticket.assignedTo.toString() !== senderId && ticket.status !== 'open'){
        // return next(new AuthorizationError('You can only reply to tickets assigned to you or unassigned open tickets.', 403));
    }

    const newMessage = {
      sender: senderId,
      message,
      timestamp: Date.now(),
      attachments: attachments || [],
      messageType: (senderRole === 'admin' || senderRole === 'support_agent') ? 'agent_reply' : 'user_message'
    };

    ticket.messages.push(newMessage);
    ticket.metadata.lastUpdatedAt = Date.now();
    ticket.metadata.updatedBy = senderId;
    
    // If user replies, change status to 'pending_agent_response' or 'reopened'
    // If agent replies, change status to 'pending_user_response'
    if (newMessage.messageType === 'user_message' && (ticket.status === 'resolved' || ticket.status === 'closed' || ticket.status === 'pending_user_response')) {
        ticket.status = 'reopened'; // Or 'pending_agent_response'
    } else if (newMessage.messageType === 'agent_reply' && ticket.status !== 'resolved' && ticket.status !== 'closed') {
        ticket.status = 'pending_user_response';
    }

    await ticket.save();
    const populatedTicket = await SupportTicket.findById(ticket._id)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('assignedTo', 'profile.firstName profile.lastName')
        .populate('messages.sender', 'profile.firstName profile.lastName role');

    // TODO: Notify other party about the new message
    // const recipient = (newMessage.messageType === 'user_message' && ticket.assignedTo) ? ticket.assignedTo : ticket.user;
    // const recipientUser = await User.findById(recipient).select('email');
    // if (recipientUser) {
    //    await sendEmail({ to: recipientUser.email, subject: `Update on Support Ticket: ${ticket.subject}`, text: `...` });
    // }

    logger.info('Message added to support ticket', { ticketId, senderId, messageId: newMessage._id });
    res.status(200).json({
      success: true,
      message: 'Message added successfully.',
      data: populatedTicket
    });
  } catch (error) {
    logger.error('Error adding message to support ticket', { ticketId: req.params.id, senderId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Support ticket not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while adding message to the ticket.', 500));
  }
};

// --- Admin/Support Agent specific actions ---

/**
 * @desc    Admin/Support: Get all support tickets (filtered, paginated)
 * @route   GET /api/v1/admin/support-tickets
 * @access  Private (Admin/SupportAgent)
 */
exports.getAllTicketsAdmin = async (req, res, next) => {
  try {
    const features = new APIFeatures(SupportTicket.find()
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('assignedTo', 'profile.firstName profile.lastName')
        .sort('-metadata.lastUpdatedAt'), req.query)
      .filter() // Allow filtering by status, priority, assignedTo, etc.
      .paginate();

    const tickets = await features.query;
    const totalTickets = await SupportTicket.countDocuments(features.getQuery()._conditions);

    logger.info('Admin retrieved all support tickets', { adminUserId: req.user.id, count: tickets.length, query: req.query });
    res.status(200).json({
      success: true,
      count: tickets.length,
      total: totalTickets,
      pagination: features.pagination,
      data: tickets
    });
  } catch (error) {
    logger.error('Admin: Error getting all support tickets', { adminUserId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving support tickets.', 500));
  }
};

/**
 * @desc    Admin/Support: Update ticket status, priority, or assign to an agent
 * @route   PUT /api/v1/admin/support-tickets/:id
 * @access  Private (Admin/SupportAgent)
 */
exports.updateTicketAdmin = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const { status, priority, assignedTo, internalNotes } = req.body;
    const adminUserId = req.user.id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return next(new NotFoundError(`Support ticket not found with ID: ${ticketId}`, 404));
    }

    // Authorization: Support agents might only be able to update tickets assigned to them or unassigned ones.
    // Admins can update any.
    if (req.user.role === 'support_agent' && ticket.assignedTo && ticket.assignedTo.toString() !== adminUserId && ticket.status !== 'open') {
        // return next(new AuthorizationError('You are not authorized to update this ticket unless it is assigned to you or unassigned.', 403));
    }

    let updated = false;
    if (status && ticket.status !== status) { ticket.status = status; updated = true; }
    if (priority && ticket.priority !== priority) { ticket.priority = priority; updated = true; }
    if (assignedTo !== undefined) { // Allows unassigning by passing null
        if (assignedTo) {
            const agentExists = await User.findOne({ _id: assignedTo, role: { $in: ['admin', 'support_agent'] } });
            if (!agentExists) return next(new NotFoundError(`Support agent with ID ${assignedTo} not found or not valid.`, 404));
        }
        ticket.assignedTo = assignedTo;
        updated = true;
    }
    if (internalNotes) { // Append to internal notes or replace, based on design
        ticket.internalNotes = ticket.internalNotes ? ticket.internalNotes + '\n---Updated by ' + req.user.profile.firstName + '---\n' + internalNotes : internalNotes;
        updated = true;
    }

    if (!updated && Object.keys(req.body).length > 0) {
        return res.status(200).json({ success: true, message: 'No changes applied to the ticket.', data: ticket });
    }
    if (!updated && Object.keys(req.body).length === 0) {
        return next(new ValidationError('No update fields provided.', 400));
    }

    ticket.metadata.lastUpdatedAt = Date.now();
    ticket.metadata.updatedBy = adminUserId;
    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('assignedTo', 'profile.firstName profile.lastName')
        .populate('messages.sender', 'profile.firstName profile.lastName role');

    // TODO: Notify user if status changed or ticket assigned
    // if (status && status !== originalStatus) { ... sendEmail ... }
    // if (assignedTo && assignedTo.toString() !== originalAssignedTo) { ... sendEmail ... }

    logger.info('Admin updated support ticket', { ticketId, adminUserId, changes: req.body });
    res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully.',
      data: populatedTicket
    });
  } catch (error) {
    logger.error('Admin: Error updating support ticket', { ticketId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Support ticket or assigned agent not found.`, 404));
    }
    next(new AppError('Server error while updating the support ticket.', 500));
  }
};

/**
 * @desc    Admin: Delete a support ticket (Soft or Hard)
 * @route   DELETE /api/v1/admin/support-tickets/:id
 * @access  Private (Admin)
 */
exports.deleteTicketAdmin = async (req, res, next) => {
    try {
        const ticketId = req.params.id;
        const adminUserId = req.user.id;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return next(new NotFoundError(`Support ticket not found with ID: ${ticketId}`, 404));
        }

        // Soft delete example:
        // ticket.status = 'deleted';
        // ticket.metadata.isDeleted = true;
        // ticket.metadata.deletedAt = Date.now();
        // ticket.metadata.deletedBy = adminUserId;
        // await ticket.save();
        // logger.info('Admin soft deleted support ticket', { ticketId, adminUserId });
        // res.status(200).json({ success: true, message: 'Support ticket soft deleted.' });

        // Hard delete:
        await ticket.deleteOne();
        logger.info('Admin hard deleted support ticket', { ticketId, adminUserId });
        res.status(200).json({ success: true, message: 'Support ticket permanently deleted.', data: {} });

    } catch (error) {
        logger.error('Admin: Error deleting support ticket', { ticketId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new NotFoundError(`Support ticket not found with ID: ${req.params.id}`, 404));
        }
        next(new AppError('Server error while deleting the support ticket.', 500));
    }
};